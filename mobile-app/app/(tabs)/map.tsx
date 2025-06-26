import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform, Text, Linking, Pressable, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { RestaurantService } from '../../lib/database';

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  link: string;
  cuisine?: string;
  address?: string;
  town?: string;
  website?: string;
}

const AMENITY_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Fast Food', value: 'fast_food' },
  { label: 'Bar', value: 'bar' },
  { label: 'Pub', value: 'pub' },
];

// https://github.com/react-native-maps/react-native-maps, RENDEER using leaflet
export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [radius, setRadius] = useState(500); // Default 500m
  const [showFilter, setShowFilter] = useState(false);
  const [userTown, setUserTown] = useState<string>('');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [showAmenityDropdown, setShowAmenityDropdown] = useState(false);

  const getTownFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const location = data.locality || data.city || data.principalSubdivision || 'Current Location';
      // console.log(data.principalSubdivision)

      return location;
    } catch (error) {
      return 'Current Location';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to use this feature.');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        let town = 'Current Location'; 
        try {
          town = await getTownFromCoordinates(
            currentLocation.coords.latitude, 
            currentLocation.coords.longitude
          );
        } catch (error) {
          console.warn('Failed to get town name, using default:', error);
        }
        setUserTown(town);

        fetchNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude, town);
      } catch (error) {
        // console.error('Error in location setup:', error);
        Alert.alert('Error', 'Failed to get your location, check your location settings.');
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (location && userTown) {
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude, userTown);
    }
  }, [radius, userTown, amenityFilter]);

  useEffect(() => {
    if ((Platform.OS === 'web' || Platform.OS === 'ios') && location) {
      Promise.all([
        import('react-leaflet'),
        import('leaflet'),
      ]).then(([{ MapContainer, TileLayer, Marker, Popup }, L]) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        const redDotIcon = new L.Icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        // user location marker (blue dot)
        const userLocationIcon = new L.Icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48],
        });

        const WebMap = () => (
          <MapContainer center={[location.coords.latitude, location.coords.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker 
              position={[location.coords.latitude, location.coords.longitude]} 
              icon={userLocationIcon}
            >
              <Popup>
                <div>
                  <strong>Your Location</strong><br />
                  <span>You are here</span>
                </div>
              </Popup>
            </Marker>
            {places.map((place) => (
              <Marker key={place.id} position={[place.lat, place.lon]} icon={redDotIcon}>
                <Popup>
                  <div>
                    <strong style={{ fontSize: '18px', display: 'block', textAlign: 'center', marginBottom: (place.cuisine || place.address || place.town || place.website) ? '4px' : '0' }}>{place.name}</strong>
                    {place.cuisine && <span>Cuisine: {place.cuisine.split(';').map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}<br /></span>}
                    {(place.cuisine && (place.address || place.town)) && ''}
                    {(place.address || place.town) && <span>Address: {place.address || place.town}<br /></span>}
                    {((place.cuisine || place.address || place.town) && place.website) && ''}
                    {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer">Website</a>}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleInfoPress(place.name, place.address || place.town || '', place.cuisine);
                      }}
                      style={{
                        background: '#007AFF',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '15px',
                        padding: '8px 18px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'background 0.2s',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        textDecoration: 'none',
                        textAlign: 'center',
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
        setMapComponent(() => WebMap);
        setMapLoading(false);
      }).catch(() => {
        Alert.alert('Error', 'Failed to load map component.');
        setMapLoading(false);
      });
    }
  }, [location, places]);

  const fetchNearbyPlaces = async (latitude: number, longitude: number, town: string) => {
    setLoading(true);
    let query = '';
    if (amenityFilter === 'all') {
      query = `[out:json];(node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:${radius},${latitude},${longitude}););out;`;
    } else {
      query = `[out:json];(node["amenity"="${amenityFilter}"](around:${radius},${latitude},${longitude}););out;`;
    }
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const fetchedPlaces = data.elements.map((el: any) => {
        const address = el.tags['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : undefined;
        return {
          id: el.id.toString(),
          name: el.tags.name || 'Unnamed',
          lat: el.lat,
          lon: el.lon,
          link: url,
          cuisine: el.tags.cuisine,
          address: address || town,
          town: town,
          website: el.tags.website,
        };
      });
      setPlaces(fetchedPlaces);
    } catch (error) {
      Alert.alert('Error', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoPress = async (placeName: string, address: string, cuisine?: string) => {
    try {
      await RestaurantService.recordInteraction(
        placeName,
        address,
        cuisine || '',
        'click'
      );
    } catch (error) {
      console.error('err recording interaction:', error);
    }

    router.push({
      pathname: '/restaurant-info',
      params: { name: placeName, address: address }
    });
  };

  const RadiusFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={styles.filterToggle} 
        onPress={() => setShowFilter(!showFilter)}
      >
        <Text style={styles.filterToggleText}>
          Radius: {radius}m {showFilter ? '▼' : '▲'}
        </Text>
      </TouchableOpacity>
      
      {showFilter && (
        <View style={styles.filterOptions}>
          <TouchableOpacity 
            style={[styles.radiusButton, radius === 500 && styles.radiusButtonActive]}
            onPress={() => setRadius(500)}
          >
            <Text style={[styles.radiusButtonText, radius === 500 && styles.radiusButtonTextActive]}>
              500m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radiusButton, radius === 750 && styles.radiusButtonActive]}
            onPress={() => setRadius(750)}
          >
            <Text style={[styles.radiusButtonText, radius === 750 && styles.radiusButtonTextActive]}>
              750m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radiusButton, radius === 1000 && styles.radiusButtonActive]}
            onPress={() => setRadius(1000)}
          >
            <Text style={[styles.radiusButtonText, radius === 1000 && styles.radiusButtonTextActive]}>
              1km
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.radiusButton, radius === 2000 && styles.radiusButtonActive]}
            onPress={() => setRadius(2000)}
          >
            <Text style={[styles.radiusButtonText, radius === 2000 && styles.radiusButtonTextActive]}>
              2km
            </Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );

  const AmenityFilter = () => (
    <View style={[styles.filterContainer, { top: showFilter ? 210 : 60 }]}> 
      <TouchableOpacity 
        style={styles.filterToggle} 
        onPress={() => setShowAmenityDropdown(!showAmenityDropdown)}
      >
        <Text style={styles.filterToggleText}>
          Type: {AMENITY_TYPES.find(t => t.value === amenityFilter)?.label} {showAmenityDropdown ? '▼' : '▲'}
        </Text>
      </TouchableOpacity>
      {showAmenityDropdown && (
        <View style={styles.filterOptions}>
          {AMENITY_TYPES.map(type => (
            <TouchableOpacity 
              key={type.value} 
              style={[styles.radiusButton, amenityFilter === type.value && styles.radiusButtonActive]}
              onPress={() => { setAmenityFilter(type.value); setShowAmenityDropdown(false); }}
            >
              <Text style={[styles.radiusButtonText, amenityFilter === type.value && styles.radiusButtonTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (loading || !location || ((Platform.OS === 'web' || Platform.OS === 'ios') && mapLoading)) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {MapComponent && <MapComponent />}
        <RadiusFilter />
        <AmenityFilter />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          pinColor="blue"
          title="Your Location"
          description="You are here"
          tracksViewChanges={false}
          anchor={{ x: 0.5, y: 0.5 }}
          centerOffset={{ x: 0, y: 0 }}
          style={{ width: 40, height: 40 }}
        />
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon,
            }}
            pinColor="red"
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{place.name}</Text>
                {place.cuisine ? (
                  <Text>Cuisine: {place.cuisine.split(';').map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</Text>
                ) : null}
                {place.address || place.town ? (
                  <Text>Address: {place.address || place.town}</Text>
                ) : null}
                {place.website ? (
                  <Text style={styles.link} onPress={() => place.website && Linking.openURL(place.website)}>
                    Website
                  </Text>
                ) : null}
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <TouchableOpacity style={styles.detailsButton} onPress={() => handleInfoPress(place.name, place.address || place.town || '', place.cuisine)}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <RadiusFilter />
      <AmenityFilter />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  calloutContainer: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    marginTop: 4,
  },
  filterContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  filterToggle: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  filterToggleText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  filterOptions: {
    marginTop: 8,
    gap: 4,
  },
  radiusButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radiusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radiusButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  radiusButtonTextActive: {
    color: 'white',
  },
  detailsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
    textDecorationLine: 'none',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
});
