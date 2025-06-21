import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform, Text, Linking, Pressable, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  link: string;
  cuisine?: string;
  address?: string;
  website?: string;
}

// https://github.com/react-native-maps/react-native-maps, RENDEER using leaflet
export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [radius, setRadius] = useState(1000); // Default 1km
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      fetchNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    }
  }, [radius]);

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

        const WebMap = () => (
          <MapContainer center={[location.coords.latitude, location.coords.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {places.map((place) => (
              <Marker key={place.id} position={[place.lat, place.lon]} icon={redDotIcon}>
                <Popup>
                  <div>
                    <strong>{place.name}</strong><br />
                    {place.cuisine && <span>Cuisine: {place.cuisine}<br /></span>}
                    {place.address && <span>Address: {place.address}<br /></span>}
                    {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer">Website</a>}<br />
                    <a href={place.link} target="_blank" rel="noopener noreferrer">Source Link</a><br />
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        router.push({
                          pathname: '/restaurant-info',
                          params: { name: place.name, address: place.address }
                        });
                      }}
                      style={{ color: 'green', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      Find out more!
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

  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    const query = `[out:json];(node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:${radius},${latitude},${longitude}););out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const fetchedPlaces = data.elements.map((el: any) => ({
        id: el.id.toString(),
        name: el.tags.name || 'Unnamed',
        lat: el.lat,
        lon: el.lon,
        link: url,
        cuisine: el.tags.cuisine,
        address: el.tags['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : undefined,
        website: el.tags.website,
      }));
      setPlaces(fetchedPlaces);
    } catch (error) {
      Alert.alert('Error', error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoPress = (placeName: string, lat: number, lon: number) => {
    router.push({
      pathname: '/restaurant-info',
      params: { name: placeName.replace(/\s+/g, "_") + " at_" + lat + "_" + lon }
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
                {place.cuisine && <Text>Cuisine: {place.cuisine}</Text>}
                {place.address && <Text>Address: {place.address}</Text>}
                {place.website && (
                  <Text style={styles.link} onPress={() => place.website && Linking.openURL(place.website)}>
                    Website
                  </Text>
                )}
                <Text style={styles.link} onPress={() => Linking.openURL(place.link)}>
                  Source Link
                </Text>
                <Pressable onPress={() => handleInfoPress(place.name, place.lat, place.lon)}>
                  <Text style={styles.infoLink}>Find out more!</Text>
                </Pressable>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <RadiusFilter />
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
    fontSize: 16,
    marginBottom: 4,
  },
  link: {
    color: 'blue',
    marginTop: 4,
  },
  infoLink: {
    color: 'green',
    marginTop: 8,
    fontWeight: 'bold',
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
});
