import { getDatabase, ref, set, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const db = getDatabase();
const auth = getAuth();

let watchId = null;

export const requestLocationPermission = async () => {
    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
            return true;
        } else if (permission.state === 'prompt') {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            return true;
        } else {
            console.log('Location permission denied');
            return false;
        }
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

export const startLocationTracking = () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const locationRef = ref(db, `userLocations/${userId}`);

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toISOString();

            set(locationRef, {
                latitude,
                longitude,
                timestamp,
                lastUpdated: timestamp
            });
        },
        (error) => {
            console.error('Error tracking location:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
};

export const stopLocationTracking = () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
};

export const getUserLocation = (userId, callback) => {
    const locationRef = ref(db, `userLocations/${userId}`);
    return onValue(locationRef, (snapshot) => {
        const location = snapshot.val();
        if (callback) callback(location);
    });
}; 