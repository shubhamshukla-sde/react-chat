import { db } from "../firebase";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const PRESENCE_TIMEOUT = 30000; // 30 seconds

// Function to set up presence tracking for a user
export const setupPresence = (userId) => {
    if (!userId) return;

    const userStatusRef = doc(db, "status", userId);
    
    // Check current status before setting
    const checkAndSetStatus = async () => {
        try {
            const statusDoc = await getDoc(userStatusRef);
            const currentStatus = statusDoc.exists() ? statusDoc.data().state : 'offline';
            
            // Only set to online if user is actually authenticated
            if (currentStatus === 'offline') {
                await setDoc(userStatusRef, {
                    state: 'online',
                    lastChanged: serverTimestamp(),
                }, { merge: true });
                console.log('User status set to online:', userId);
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    };

    // Handle visibility change
    const handleVisibilityChange = async () => {
        try {
            if (document.visibilityState === 'hidden') {
                await setDoc(userStatusRef, {
                    state: 'offline',
                    lastChanged: serverTimestamp(),
                }, { merge: true });
                console.log('User status set to offline (visibility change):', userId);
            } else {
                await checkAndSetStatus();
            }
        } catch (error) {
            console.error('Error handling visibility change:', error);
        }
    };

    // Handle window close
    const handleBeforeUnload = async () => {
        try {
            await setDoc(userStatusRef, {
                state: 'offline',
                lastChanged: serverTimestamp(),
            }, { merge: true });
            console.log('User status set to offline (beforeunload):', userId);
        } catch (error) {
            console.error('Error handling beforeunload:', error);
        }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial status check
    checkAndSetStatus();

    // Return cleanup function
    return () => {
        // Remove event listeners
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Set status to offline during cleanup
        setDoc(userStatusRef, {
            state: 'offline',
            lastChanged: serverTimestamp(),
        }, { merge: true }).then(() => {
            console.log('User status set to offline (cleanup):', userId);
        }).catch(error => {
            console.error('Error setting offline status during cleanup:', error);
        });
    };
};

// Function to get user presence status
export const getUserPresence = (userId, callback) => {
    if (!userId) return;

    const userStatusRef = doc(db, "status", userId);
    
    // First check current status
    getDoc(userStatusRef).then((doc) => {
        if (doc.exists()) {
            const data = doc.data();
            console.log('Current user status:', userId, data.state);
            callback(data.state);
        } else {
            console.log('No status found for user:', userId);
            callback('offline');
        }
    }).catch(error => {
        console.error('Error getting initial presence:', error);
        callback('offline');
    });

    // Then listen for changes
    return onSnapshot(userStatusRef, 
        (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                console.log('User status updated:', userId, data.state);
                callback(data.state);
            } else {
                console.log('No status found for user:', userId);
                callback('offline');
            }
        },
        (error) => {
            console.error('Error in presence listener:', error);
            callback('offline');
        }
    );
}; 