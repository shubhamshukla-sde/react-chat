import React, { useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import { getProfilePicture, handleImageError } from '../utils/imageUtils'
import { getUserPresence } from '../utils/presenceUtils'

const Chats = () => {
    const [chats, setChats] = useState([])
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
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), async (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const chatData = docSnapshot.data()
                    const chatArray = Object.entries(chatData).sort((a, b) => b[1].date - a[1].date)
                    
                    // Fetch user data for each chat
                    const updatedChats = await Promise.all(
                        chatArray.map(async ([chatId, chatInfo]) => {
                            const userDocRef = doc(db, "users", chatInfo.userInfo.uid)
                            const userDocSnap = await getDoc(userDocRef)
                            const userData = userDocSnap.data()

                            // Set up presence listener for each user
                            const presenceUnsub = getUserPresence(chatInfo.userInfo.uid, (status) => {
                                setUserPresence(prev => ({
                                    ...prev,
                                    [chatInfo.userInfo.uid]: status
                                }))
                            })

                            return [
                                chatId,
                                {
                                    ...chatInfo,
                                    userInfo: {
                                        ...chatInfo.userInfo,
                                        ...userData
                                    },
                                    presenceUnsub
                                }
                            ]
                        })
                    )
                    
                    setChats(updatedChats)
                }
            })

            return () => {
                unsub()
                // Clean up presence listeners
                chats.forEach(([_, chat]) => {
                    if (chat.presenceUnsub) {
                        chat.presenceUnsub()
                    }
                })
            }
        }

        currentUser.uid && getChats()
    }, [currentUser.uid])

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
            {chats.map((chat) => {
                const userId = chat[1].userInfo.uid;
                const isOnline = userPresence[userId] === 'online';
                
                return (
                    <div
                        className="userChat"
                        key={chat[0]}
                        onClick={() => handleSelect(chat[1].userInfo)}
                    >
                        <div style={{ position: 'relative' }}>
                            <img 
                                src={getProfilePicture(chat[1].userInfo, currentUserData)}
                                alt="" 
                                onError={handleImageError}
                            />
                            <div className={`statusIndicator ${isOnline ? 'online' : 'offline'}`} />
                        </div>
                        <div className="userChatInfo">
                            <span>{chat[1].userInfo.displayName}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default Chats