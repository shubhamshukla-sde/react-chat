import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { getProfilePicture, handleImageError } from '../utils/imageUtils'

const Messages = () => {
    const { data } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [messages, setMessages] = React.useState([])
    const [currentUserData, setCurrentUserData] = React.useState(null)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const [swipeState, setSwipeState] = useState({ isSwiping: false, startX: 0, currentX: 0, messageId: null })
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [messageToDelete, setMessageToDelete] = useState(null)

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            setTimeout(() => {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }, 0); // Defer scroll to ensure content is rendered and scrollHeight is accurate
        }
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

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleTouchStart = (e, messageId) => {
        const touch = e.touches[0]
        setSwipeState({
            isSwiping: true,
            startX: touch.clientX,
            currentX: touch.clientX,
            messageId
        })
    }

    const handleTouchMove = (e) => {
        if (!swipeState.isSwiping) return
        const touch = e.touches[0]
        setSwipeState(prev => ({
            ...prev,
            currentX: touch.clientX
        }))
    }

    const handleTouchEnd = () => {
        if (!swipeState.isSwiping) return
        
        const swipeDistance = swipeState.currentX - swipeState.startX
        const SWIPE_THRESHOLD = 100 // Minimum distance to trigger delete

        if (swipeDistance < -SWIPE_THRESHOLD) {
            setMessageToDelete(swipeState.messageId)
            setShowDeleteConfirm(true)
        }

        setSwipeState({ isSwiping: false, startX: 0, currentX: 0, messageId: null })
    }

    const handleDeleteMessage = async () => {
        if (!messageToDelete) return

        try {
            const messageToRemove = messages.find(m => m.id === messageToDelete)
            if (!messageToRemove) return

            await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayRemove(messageToRemove)
            })
            setShowDeleteConfirm(false)
            setMessageToDelete(null)
        } catch (error) {
            console.error('Error deleting message:', error)
            alert('Failed to delete message')
        }
    }

    const getSwipeStyle = (messageId) => {
        if (!swipeState.isSwiping || swipeState.messageId !== messageId) return {}
        
        const swipeDistance = swipeState.currentX - swipeState.startX
        const opacity = Math.min(Math.abs(swipeDistance) / 200, 1)
        
        return {
            transform: `translateX(${swipeDistance}px)`,
            opacity: 1 - opacity
        }
    }

    return (
        <div 
            ref={messagesContainerRef}
            className="messages" 
        >
            {messages.map((m) => (
                <div 
                    className={`message ${m.senderId === currentUser.uid ? "owner" : ""}`} 
                    key={m.id}
                    onTouchStart={(e) => handleTouchStart(e, m.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={getSwipeStyle(m.id)}
                >
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

            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                        <p>Delete this message?</p>
                        <div className="delete-confirm-buttons">
                            <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button onClick={handleDeleteMessage} className="delete">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Messages