import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';
import { RestaurantService } from '../../lib/database';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!name && !address) return;
      
      try {
        const favorites = await RestaurantService.getFavoriteRestaurants();
        const isAlreadyFavorite = favorites.some(fav => {
          if (name && address) {
            return fav.restaurant_name === name && fav.restaurant_address === address;
          } else if (name) {
            return fav.restaurant_name === name;
          } else if (address) {
            return fav.restaurant_address === address;
          }
          return false;
        });
        setIsFavorite(isAlreadyFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
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

        // record a view interaction
        if (name || address) {
          try {
            await RestaurantService.recordInteraction(
              name as string || '',
              address as string || '',
              '', 
              'view'
            );
          } catch (error) {
            console.error('Error recording view interaction:', error);
          }
        }

        // Don't make API call if we don't have any restaurant information
        if (!name && !address) {
          setEvents(prev => [...prev, {
            title: "Error",
            data: "No restaurant information available"
          }]);
          return;
        }

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
                  content: `Research about ${name || ''} restaurant/amenity ${address ? ` located at ${address}` : ''}. Provide food and user reviews, what the menu entails, and the price range.`
                }
              ],
              configurable: {
                query_generator_model: "gemini-2.5-flash-lite-preview-06-17",
                reflection_model: "gemini-2.5-flash-lite-preview-06-17",
                answer_model: "gemini-2.5-flash-lite-preview-06-17",
                number_of_initial_queries: 3,
                max_research_loops: 3
              }
            },
            stream_mode: "messages-tuple"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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

                if (data.error) {
                  setEvents(prev => [...prev, {
                    title: "Error",
                    data: `API Error: ${data.message || data.error}`
                  }]);
                  continue;
                }

                if (Array.isArray(data)) {
                  data.forEach((message, index) => {
                    if (typeof message === 'object' && message !== null) {
                      if (message.content) {
                        setFinalAnswer(message.content);
                      }
                      if (message.tool_calls) {
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
                  if (typeof data === 'object' && data !== null) {
                    if (data.content) {
                      setFinalAnswer(data.content);
                    }
                  }
                }
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
          data: `Failed to load restaurant information: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]);
      } finally {
        setLoading(false);
      }
    };

    if (name || address) {
      fetchRestaurantInfo();
    }
  }, [name, address]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [events, finalAnswer]);

  const handleToggleFavorite = async () => {
    if (!name && !address) {
      Alert.alert('Error', 'Cannot favorite restaurant without name or address');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      const result = await RestaurantService.toggleFavorite(
        name as string || '',
        address as string || ''
      );
      setIsFavorite(result.isFavorite);
      
      if (result.isFavorite) {
        Alert.alert('Success', 'Restaurant added to favorites!');
      } else {
        Alert.alert('Success', 'Restaurant removed from favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Researching {name || address || 'restaurant'}...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {name || address || 'Unknown Restaurant'}
        </Text>
        <TouchableOpacity 
          style={[
            styles.favoriteButton, 
            isFavorite && styles.favoriteButtonActive,
            favoriteLoading && styles.favoriteButtonLoading,
            (!name && !address) && styles.favoriteButtonDisabled
          ]}
          onPress={handleToggleFavorite}
          disabled={favoriteLoading || (!name && !address)}
        >
          <Text style={[
            styles.favoriteButtonText, 
            isFavorite && styles.favoriteButtonTextActive,
            (!name && !address) && styles.favoriteButtonTextDisabled
          ]}>
            {favoriteLoading ? '⏳' : (isFavorite ? '❤️ ' : '🤍 ')} 
            {favoriteLoading ? 'Loading...' : (isFavorite ? 'Favorited' : 'Favorite')}
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
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
  favoriteButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 100,
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  favoriteButtonLoading: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  favoriteButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteButtonTextActive: {
    color: '#fff',
  },
  favoriteButtonTextDisabled: {
    color: '#999',
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