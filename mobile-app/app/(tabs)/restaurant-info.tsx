import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';

interface ResearchEvent {
  title: string;
  data: string;
}

export default function RestaurantInfo() {
  const { name, address } = useLocalSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<ResearchEvent[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('Search params :', { name, address, nameType: typeof name, addressType: typeof address });
  }, [name, address]);

  if (name === undefined && address === undefined) {

    router.replace('/map');
  }

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        setLoading(true);
        setEvents([]);
        setFinalAnswer('');

        const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:2024';
        const response = await fetch(`${apiUrl}/runs/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistant_id: "agent",
            input: {
              messages: [
                {
                  role: "human",
                  content: `Research about ${name} restaurant/amenity located at ${address}. Provide food and user reviews, what the menu entails, and the price range.`
                }
              ],
              configurable: {
                query_generator_model: "gemini-2.5-flash",
                reflection_model: "gemini-2.5-flash",
                answer_model: "gemini-2.5-flash",
                number_of_initial_queries: 3,
                max_research_loops: 3
              }
            },
            stream_mode: "messages-tuple"
          })
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        let buffer = '';
        let currentEvent = '';
        let currentData = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (!line.trim()) continue;

            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7);
              console.log('Current event:', currentEvent);
            } else if (line.startsWith('data: ')) {
              currentData = line.slice(6);
              try {
                const data = JSON.parse(currentData);
                console.log('Received data:', data);
                // console.log(Array.isArray(data));

                // if (currentEvent === 'messages') {
                  if (Array.isArray(data)) {

                    console.log(data.length)
                    data.forEach((message, index) => {
                      console.log(`Processing message ${index}:`, message.content);
                      
                      if (typeof message === 'object' && message !== null) {
                        console.log('Object message:', JSON.stringify(message, null, 2));
                        if (message.content) {
                          console.log('Setting final answer with content:', message.content);
                          setFinalAnswer(message.content);
                        }
                        if (message.tool_calls) {
                          console.log('Processing tool calls:', JSON.stringify(message.tool_calls, null, 2));
                          message.tool_calls.forEach((toolCall: any) => {
                            if (toolCall.name === 'SearchQueryList') {
                              setEvents(prev => [...prev, {
                                title: "Search Queries",
                                data: toolCall.args.query.join(", ")
                              }]);
                            } else if (toolCall.name === 'Reflection') {
                              setEvents(prev => [...prev, {
                                title: "Research Status",
                                data: toolCall.args.is_sufficient
                                  ? "Research complete, generating final answer."
                                  : `Continuing research with: ${toolCall.args.follow_up_queries?.join(", ") || "additional queries"}`
                              }]);
                            }
                          });
                        }
                      }
                    });
                  } else {
                    console.log('Received non-array data:', JSON.stringify(data, null, 2));
                    if (typeof data === 'object' && data !== null) {
                      if (data.content) {
                        console.log('Setting final answer with single message content:', data.content);
                        setFinalAnswer(data.content);
                      }
                    }
                  }
                // }
              } catch (e) {
                console.error('Error parsing event data:', e, 'Line:', line);
                setEvents(prev => [...prev, {
                  title: "Error",
                  data: "Error processing server response"
                }]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error);
        setEvents(prev => [...prev, {
          title: "Error",
          data: "Failed to load restaurant information"
        }]);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchRestaurantInfo();
    }
  }, [name, address]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [events, finalAnswer]);

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Researching {name}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event, index) => (
          <View key={index} style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventData}>{event.data}</Text>
          </View>
        ))}
        {finalAnswer && (
          <View style={styles.messageContainer}>
            <Markdown style={markdownStyles}>
              {finalAnswer}
            </Markdown>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  eventContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  eventData: {
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
});

const markdownStyles = {
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline' as const,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  list: {
    marginBottom: 12,
  },
  listItem: {
    marginBottom: 4,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    paddingLeft: 12,
    marginBottom: 12,
  },
}; 