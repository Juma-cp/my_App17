import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Polygon, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geofire from 'geofire-common';
import { decryptPHI } from './EncryptionService';

const HIGH_RISK_RADIUS = 100; // meters
const SOS_UPDATE_INTERVAL = 30000; // 30 seconds

export default function TriggerMap({ patientId, triggerZones }) {
  const [location, setLocation] = useState(null);
  const [inHighRiskZone, setInHighRiskZone] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        checkRiskZones(latitude, longitude);
      },
      error => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [triggerZones]);

  useEffect(() => {
    let sosInterval;
    if (inHighRiskZone && !sosActive) {
      activateSOS();
      sosInterval = setInterval(activateSOS, SOS_UPDATE_INTERVAL);
      setSosActive(true);
    }

    return () => clearInterval(sosInterval);
  }, [inHighRiskZone]);

  const checkRiskZones = (lat, lng) => {
    const inZone = triggerZones.some(zone => {
      const decryptedZone = JSON.parse(decryptPHI(zone.encryptedGeo));
      const distance = Geofire.distanceBetween(
        [lat, lng],
        [decryptedZone.lat, decryptedZone.lng]
      ) * 1000; // to meters
      
      return distance <= decryptedZone.radius;
    });
    
    setInHighRiskZone(inZone);
  };

  const activateSOS = () => {
    // Implementation would send encrypted SOS to backend
    console.log('SOS ACTIVATED! Sending location to hospital');
  };

  return (
    <MapView style={{ flex: 1 }} 
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
      
      {location && (
        <Circle center={location}
          radius={HIGH_RISK_RADIUS}
          strokeWidth={1}
          strokeColor="#1a66ff"
          fillColor="rgba(230,238,255,0.5)"
        />
      )}
      
      {triggerZones.map((zone, index) => {
        const decrypted = JSON.parse(decryptPHI(zone.encryptedGeo));
        return (
          <Circle key={index}
            center={{ latitude: decrypted.lat, longitude: decrypted.lng }}
            radius={decrypted.radius}
            strokeWidth={1}
            strokeColor="#FF0000"
            fillColor="rgba(255,0,0,0.3)"
          />
        );
      })}
    </MapView>
  );
            }
