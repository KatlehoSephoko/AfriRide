import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface AppMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  drivers?: Array<{ id: string; latitude: number; longitude: number }>;
}

export const AppMap: React.FC<AppMapProps> = ({ userLocation, drivers = [] }) => {
  return (
    <View style={StyleSheet.absoluteFillObject} accessible={false} importantForAccessibility="no-hide-descendants">
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
          />
        ))}
      </MapView>
    </View>
  );
};
