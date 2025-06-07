import React, { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getProfilePicture, handleImageError } from '../utils/imageUtils'

const Messages = () => {
    const { data } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [messages, setMessages] = React.useState([])
    const [currentUserData, setCurrentUserData] = React.useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if (doc.exists()) {
                setMessages(doc.data().messages)
            }
        })

        return () => {
            unSub()
        }
    }, [data.chatId])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="messages" style={{ height: 'calc(100% - 100px)', overflowY: 'auto' }}>
            {messages.map((m) => (
                <div className={`message ${m.senderId === currentUser.uid ? "owner" : ""}`} key={m.id}>
                    <div className="messageInfo">
                        <img
                            src={getProfilePicture(m.senderId === currentUser.uid ? currentUserData : data.user)}
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
                                    borderRadius: '10px',
                                    marginTop: m.text ? '10px' : '0'
                                }}
                            />
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default Messages