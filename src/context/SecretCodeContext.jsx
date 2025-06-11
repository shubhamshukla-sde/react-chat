import React, { createContext, useState, useEffect, useContext } from 'react';
import SecretCodeService from '../services/secretCodeService';
import { AuthContext } from './AuthContext';

export const SecretCodeContext = createContext();

export const SecretCodeProvider = ({ children }) => {
    const [activeSecretCode, setActiveSecretCode] = useState(SecretCodeService.getSecretCodeFromSession());
    const { currentUser } = useContext(AuthContext);

    // Listen for changes in session storage to update activeSecretCode
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'chatAppSecretCode') {
                setActiveSecretCode(event.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Clear secret code on logout
    useEffect(() => {
        if (!currentUser) {
            SecretCodeService.removeSecretCodeFromSession();
            setActiveSecretCode(null);
        }
    }, [currentUser]);

    return (
        <SecretCodeContext.Provider value={{ activeSecretCode, setActiveSecretCode }}>
            {children}
        </SecretCodeContext.Provider>
    );
};

export const useSecretCode = () => {
    const context = useContext(SecretCodeContext);
    if (!context) {
        throw new Error('useSecretCode must be used within a SecretCodeProvider');
    }
    return context;
}; 