import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { storeLocation, checkTriggers } from './api';

const LOCATION_TASK = 'background-location-task';

// Define background location task
TaskManager.defineTask(LOCATION_TASK, async ({ data: { locations }, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  
  try {
    const location = locations[0];
    if (location) {
      // Save to local storage for offline use
      await AsyncStorage.setItem('lastLocation', JSON.stringify(location));
      
      // Check for known triggers
      const triggers = await checkTriggers(location.coords);
      
      if (triggers.length > 0) {
        // Show alert to user
        Alert.alert(
          'Trigger Warning', 
          `You're near ${triggers.join(', ')}`
        );
      }
      
      // Sync with backend when online
      if (navigator.onLine) {
        await storeLocation(location.coords);
      }
    }
  } catch (e) {
    console.error('Location processing error:', e);
  }
});

// Start background tracking
export async function startLocationTracking() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50, // meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Addiction Tracker',
        notificationBody: 'Active location monitoring',
      },
    });
    return true;
  }
  return false;
                                 }
