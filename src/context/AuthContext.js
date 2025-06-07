import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { setupPresence } from "../utils/presenceUtils";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (result.user) {
                // Set up presence tracking when user logs in
                const unsubscribe = setupPresence(result.user.uid);
                // Store the unsubscribe function in the user object for cleanup
                result.user.unsubscribePresence = unsubscribe;
            }
            return result;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (currentUser) {
                console.log('Logging out user:', currentUser.uid);
                
                // First, update the status to offline
                const userStatusRef = doc(db, "status", currentUser.uid);
                await setDoc(userStatusRef, {
                    state: 'offline',
                    lastChanged: serverTimestamp(),
                }, { merge: true });

                console.log('Status updated to offline');

                // Clean up presence tracking
                if (currentUser.unsubscribePresence) {
                    currentUser.unsubscribePresence();
                    console.log('Presence tracking cleaned up');
                }

                // Then sign out
                await signOut(auth);
                console.log('User signed out');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    console.log('User signed in:', user.uid);
                    // User is signed in
                    const presenceUnsubscribe = setupPresence(user.uid);
                    user.unsubscribePresence = presenceUnsubscribe;
                } else {
                    console.log('User signed out');
                    // User is signed out
                    if (currentUser?.unsubscribePresence) {
                        currentUser.unsubscribePresence();
                    }
                }
                setCurrentUser(user);
                setLoading(false);
            } catch (error) {
                console.error('Error in auth state change:', error);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            // Clean up presence tracking when component unmounts
            if (currentUser?.unsubscribePresence) {
                currentUser.unsubscribePresence();
            }
        };
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};