import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';
import { RestaurantService } from '../../lib/database';
import { IconSymbol } from '../../components/ui/IconSymbol';


const SearchIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconCircle, { backgroundColor: '#007AFF' }]}>
      <IconSymbol name="magnifyingglass" size={20} color="#ffffff" />
    </View>
  </View>
);

const AnalyticsIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconCircle, { backgroundColor: '#007AFF' }]}>
      <IconSymbol name="chart.bar.fill" size={20} color="#ffffff" />
    </View>
  </View>
);

const ErrorIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconCircle, { backgroundColor: '#e74c3c' }]}>
      <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#ffffff" />
    </View>
  </View>
);

const DocumentIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconCircle, { backgroundColor: '#007AFF' }]}>
      <IconSymbol name="doc.text.fill" size={20} color="#ffffff" />
    </View>
  </View>
);

const HeartIcon = ({ filled = false }) => (
  <IconSymbol 
    name={filled ? "heart.fill" : "heart"} 
    size={24} 
    color={filled ? "#e74c3c" : "#e74c3c"} 
  />
);

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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
          <Text style={styles.loadingText}>
            Researching {name || address || 'restaurant'}...
          </Text>
          <Text style={styles.loadingSubtext}>
            Gathering reviews, menu details, and pricing information
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {name || address || 'Unknown Restaurant'}
            </Text>
            <View style={styles.titleUnderline} />
          </View>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleToggleFavorite}
            disabled={favoriteLoading || (!name && !address)}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#e74c3c" />
            ) : (
              <HeartIcon filled={isFavorite} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 && (
          <View style={styles.researchSection}>
            <Text style={styles.sectionTitle}>Research Progress</Text>
            {events.map((event, index) => (
              <View key={index} style={styles.eventContainer}>
                <View style={styles.eventHeader}>
                  {event.title === 'Search Queries' ? <SearchIcon /> :
                    event.title === 'Research Status' ? <AnalyticsIcon /> :
                      event.title === 'Error' ? <ErrorIcon /> : <DocumentIcon />}
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.blueDot} />
                </View>
                <Text style={styles.eventData}>{event.data}</Text>
              </View>
            ))}
          </View>
        )}

        {finalAnswer && (
          <View style={styles.resultSection}>
            <View style={styles.finalAnswerHeader}>
              <Text style={styles.finalAnswerTitle}>Restaurant Information</Text>
              <View style={styles.finalAnswerBadge}>
                <Text style={styles.finalAnswerBadgeText}>Complete</Text>
              </View>
            </View>
            <View style={styles.finalAnswerContainer}>
              <Markdown style={markdownStyles}>
                {finalAnswer}
              </Markdown>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingSpinner: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: Constants.statusBarHeight + 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  titleUnderline: {
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    width: 60,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    paddingLeft: 4,
  },
  researchSection: {
    marginBottom: 32,
  },
  resultSection: {
    marginBottom: 32,
  },
  eventContainer: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  eventData: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    paddingLeft: 44,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    position: 'absolute',
    right: 12,
    top: 12,
  },
  finalAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  finalAnswerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  finalAnswerBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  finalAnswerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalAnswerContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  bottomPadding: {
    height: 40,
  },
});

const markdownStyles = {
  body: {
    color: '#2c3e50',
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'System',
  },
  heading1: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 24,
    color: '#2c3e50',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 20,
    color: '#007AFF',
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 16,
    color: '#34495e',
    lineHeight: 26,
  },
  paragraph: {
    marginBottom: 18,
    lineHeight: 28,
    fontSize: 17,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline' as const,
    fontWeight: '500' as const,
  },
  strong: {
    fontWeight: '700' as const,
    color: '#2c3e50',
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#5a6c7d',
  },
  list: {
    marginBottom: 18,
  },
  listItem: {
    marginBottom: 10,
    paddingLeft: 12,
    fontSize: 17,
    lineHeight: 26,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 15,
    fontFamily: 'Courier',
    color: '#e74c3c',
  },
  code_block: {
    backgroundColor: '#f1f3f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 15,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
}; 