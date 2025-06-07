import React, { useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import { getProfilePicture, handleImageError } from '../utils/imageUtils'

const Chats = () => {
    const [chats, setChats] = useState([])
    const { currentUser } = useContext(AuthContext)
    const { dispatch, data } = useContext(ChatContext)
    const [currentUserData, setCurrentUserData] = useState(null)

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
                            return [
                                chatId,
                                {
                                    ...chatInfo,
                                    userInfo: {
                                        ...chatInfo.userInfo,
                                        ...userData
                                    }
                                }
                            ]
                        })
                    )
                    
                    setChats(updatedChats)
                }
            })

            return () => {
                unsub()
            }
        }

        currentUser.uid && getChats()
    }, [currentUser.uid])

    const handleSelect = (u) => {
        dispatch({ type: "CHANGE_USER", payload: u })
        // Hide sidebar when a user is selected
        dispatch({ type: "TOGGLE_SIDEBAR", payload: false })
    }

    return (
        <div className="chats" style={{ height: 'calc(100% - 110px)', overflowY: 'auto' }}>
            {chats.map((chat) => (
                <div
                    className="userChat"
                    key={chat[0]}
                    onClick={() => handleSelect(chat[1].userInfo)}
                >
                    <img 
                        src={getProfilePicture(chat[1].userInfo, currentUserData)}
                        alt="" 
                        onError={handleImageError}
                    />
                    <div className="userChatInfo">
                        <span>{chat[1].userInfo.displayName}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Chats