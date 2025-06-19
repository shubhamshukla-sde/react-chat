import React, { useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import { getProfilePicture, handleImageError } from '../utils/imageUtils'
import { getUserPresence } from '../utils/presenceUtils'
import SecretCodeService from '../services/secretCodeService'

const Chats = () => {
    const [users, setUsers] = useState([])
    const { currentUser } = useContext(AuthContext)
    const { dispatch } = useContext(ChatContext)
    const [currentUserData, setCurrentUserData] = useState(null)
    const [userPresence, setUserPresence] = useState({})

    useEffect(() => {
        const fetchCurrentUserData = async () => {
            if (currentUser?.uid) {
                const userDocRef = doc(db, "users", currentUser.uid)
                const userDocSnap = await getDoc(userDocRef)
                if (userDocSnap.exists()) {
                    setCurrentUserData(userDocSnap.data())
                }
            }
        }

        fetchCurrentUserData()
    }, [currentUser?.uid])

    useEffect(() => {
        const getAllUsers = async () => {
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            let allUsers = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser.uid);

            const activeSecretCode = SecretCodeService.getSecretCodeFromSession();
            console.log("Chats - Active Secret Code from Session:", activeSecretCode);

            allUsers = allUsers.filter(user => {
                const userHasSecretCode = user.secretCodeHash !== undefined && user.secretCodeHash !== null;

                if (activeSecretCode) {
                    return userHasSecretCode && user.secretCodeHash === activeSecretCode;
                } else {
                    return !userHasSecretCode;
                }
            });

            setUsers(allUsers);

            const presenceUnsubs = {};
            allUsers.forEach(user => {
                const presenceUnsub = getUserPresence(user.id, (status) => {
                    setUserPresence(prev => ({
                        ...prev,
                        [user.id]: status
                    }));
                });
                presenceUnsubs[user.id] = presenceUnsub;
            });

            return () => {
                Object.values(presenceUnsubs).forEach(unsub => unsub());
            };
        };

        currentUser.uid && getAllUsers();

    }, [currentUser.uid]);

    const handleSelect = (user) => {
        dispatch({ 
            type: "CHANGE_USER", 
            payload: user 
        })
        dispatch({ 
            type: "TOGGLE_SIDEBAR", 
            payload: false 
        })
    }

    return (
        <div className="chats" style={{ height: 'calc(100% - 110px)', overflowY: 'auto' }}>
            {users.map((userItem) => {
                const isOnline = userPresence[userItem.id] === 'online';
                
                return (
                    <div
                        className="userChat"
                        key={userItem.id}
                        onClick={() => handleSelect(userItem)}
                    >
                        <div style={{ position: 'relative' }}>
                            <img 
                                src={getProfilePicture(userItem, currentUserData)}
                                alt="" 
                                onError={handleImageError}
                            />
                            <div className={`statusIndicator ${isOnline ? 'online' : 'offline'}`} />
                        </div>
                        <div className="userChatInfo">
                            <span>{userItem.displayName}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default Chats