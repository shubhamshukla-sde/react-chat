import React, { useContext, useEffect, useState, useRef } from 'react'
import Message from './Message'
import { ChatContext } from '../context/ChatContext'
import { onSnapshot } from 'firebase/firestore'
import {db} from "../firebase"
import { AuthContext } from '../context/AuthContext'
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";

const Messages = () => {
    const [messages, setMessages] = useState([])
    const {data} = useContext(ChatContext)
    const {currentUser} = useContext(AuthContext)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            if (doc.exists()) {
                const newMessages = doc.data().messages;
                setMessages(newMessages);
            }
        });

        return () => {
            unSub();
        }
    }, [data.chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className='messages'>
            {messages.map(m => (
                <Message message={m} key={m.id}/>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default Messages