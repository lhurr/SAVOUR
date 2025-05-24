import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

import MapView, { Marker } from 'react-native-maps';

import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    const radius = 3000;
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
      }));
      setPlaces(fetchedPlaces);
    } catch (error) {
      Alert.alert('eror', 'failll');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (<View style={styles.loader}><ActivityIndicator size="large" /></View>);
  }

  return (<View style={styles.container}>{Platform.OS === 'web' ? (<MapContainer center={[location.coords.latitude, location.coords.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>{places.map((place) => (<LeafletMarker key={place.id} position={[place.lat, place.lon]}><Popup>{place.name}</Popup></LeafletMarker>))}</MapContainer>) : (<MapView style={styles.map} initialRegion={{latitude: location.coords.latitude,longitude: location.coords.longitude,latitudeDelta: 0.03,longitudeDelta: 0.03,}} showsUserLocation={true}>{places.map((place) => (<Marker key={place.id} coordinate={{latitude: place.lat,longitude: place.lon,}} title={place.name}/>))}</MapView>)}</View>);
}

const styles = StyleSheet.create({container:{flex:1},map:{flex:1},loader:{flex:1,justifyContent:'center',alignItems:'center'}});