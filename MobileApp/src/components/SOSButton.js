import React from 'react';
import { View, TouchableOpacity, Text, Alert, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { triggerSOS } from '../services/api';

const SOSButton = () => {
  const handlePress = () => {
    Vibration.vibrate([500, 500, 500]); // Vibrate pattern
    
    Alert.alert(
      'EMERGENCY ASSISTANCE',
      'Are you sure you want to request immediate help?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Help', onPress: sendSOS }
      ]
    );
  };

  const sendSOS = async () => {
    try {
      const location = await getCurrentPosition();
      await triggerSOS(location);
      // Notify emergency contacts
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency request');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={styles.sosButton}
    >
      <Icon name="emergency" size={30} color="white" />
      <Text style={styles.sosText}>SOS</Text>
    </TouchableOpacity>
  );
};

const styles = {
  sosButton: {
    backgroundColor: 'red',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold'
  }
};

export default SOSButton;
