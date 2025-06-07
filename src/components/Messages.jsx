import React, { useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import { getProfilePicture, handleImageError } from '../utils/imageUtils'

const Messages = () => {
    const [messages, setMessages] = useState([])
    const { data } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [userData, setUserData] = useState(null)
    const [currentUserData, setCurrentUserData] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            if (data.user?.uid) {
                const userDocRef = doc(db, "users", data.user.uid)
                const userDocSnap = await getDoc(userDocRef)
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data())
                }
            }
        }

        const fetchCurrentUserData = async () => {
            if (currentUser?.uid) {
                const userDocRef = doc(db, "users", currentUser.uid)
                const userDocSnap = await getDoc(userDocRef)
                if (userDocSnap.exists()) {
                    setCurrentUserData(userDocSnap.data())
                }
            }
        }

        fetchUserData()
        fetchCurrentUserData()
    }, [data.user?.uid, currentUser?.uid])

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (docSnapshot) => {
            docSnapshot.exists() && setMessages(docSnapshot.data().messages)
        })

        return () => {
            unSub()
        }
    }, [data.chatId])

    return (
        <div className="messages">
            {messages.map((m) => (
                <div className={`message ${m.senderId === currentUser.uid ? "owner" : ""}`} key={m.id}>
                    <div className="messageInfo">
                        <img 
                            src={getProfilePicture(
                                m.senderId === currentUser.uid ? currentUserData : userData,
                                currentUserData
                            )}
                            alt="" 
                            onError={handleImageError}
                        />
                    </div>
                    <div className="messageContent">
                        {m.text && <p>{m.text}</p>}
                        {m.img && (
                            <img 
                                src={m.img} 
                                alt="" 
                                style={{ 
                                    maxWidth: '300px', 
                                    maxHeight: '300px', 
                                    objectFit: 'contain',
                                    borderRadius: '10px',
                                    marginTop: m.text ? '10px' : '0'
                                }}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Messages