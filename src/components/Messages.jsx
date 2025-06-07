import React, { useState, useEffect, useRef, useContext } from 'react'
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Messages = () => {
    const [messages, setMessages] = useState([])
    const ref = useRef()
    const { currentUser } = useContext(AuthContext)
    const { data } = useContext(ChatContext)

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if (doc.exists()) {
                const messagesData = doc.data().messages
                setMessages(messagesData)
            }
        })

        return () => {
            unSub()
        }
    }, [data.chatId])

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="messages">
            {messages.map((m) => (
                <div
                    ref={ref}
                    className={`message ${m.senderId === currentUser.uid ? "owner" : ""}`}
                    key={m.id}
                >
                    <div className="messageInfo">
                        <img
                            src={
                                m.senderId === currentUser.uid
                                    ? currentUser.photoURL
                                    : data.user.photoURL
                            }
                            alt=""
                        />
                    </div>
                    <div className="messageContent">
                        {m.text && <p>{m.text}</p>}
                        {m.img && (
                            <img
                                src={`data:image/jpeg;base64,${m.img}`}
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