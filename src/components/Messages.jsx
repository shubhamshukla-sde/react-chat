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
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null })
    const longPressTimer = useRef(null)
    const LONG_PRESS_DURATION = 500 // 500ms for long press

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
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

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Handle long press
    const handleMouseDown = (e, messageId) => {
        if (e.button === 2) return // Ignore right click
        longPressTimer.current = setTimeout(() => {
            setContextMenu({
                show: true,
                x: e.clientX,
                y: e.clientY,
                messageId
            })
        }, LONG_PRESS_DURATION)
    }

    const handleMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
        }
    }

    const handleMouseLeave = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
        }
    }

    // Handle right click
    const handleContextMenu = (e, messageId) => {
        e.preventDefault()
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            messageId
        })
    }

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, messageId: null })
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    // Delete message
    const handleDeleteMessage = async (messageId) => {
        try {
            const messageToDelete = messages.find(m => m.id === messageId)
            if (!messageToDelete) return

            await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayRemove(messageToDelete)
            })
            setContextMenu({ show: false, x: 0, y: 0, messageId: null })
        } catch (error) {
            console.error('Error deleting message:', error)
            alert('Failed to delete message')
        }
    }

    return (
        <div 
            ref={messagesContainerRef}
            className="messages" 
            style={{ 
                height: 'calc(100% - 100px)', 
                overflowY: 'auto',
                scrollBehavior: 'smooth'
            }}
        >
            {messages.map((m) => (
                <div 
                    className={`message ${m.senderId === currentUser.uid ? "owner" : ""}`} 
                    key={m.id}
                    onMouseDown={(e) => handleMouseDown(e, m.id)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={(e) => handleContextMenu(e, m.id)}
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
            
            {contextMenu.show && (
                <div 
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 1000
                    }}
                >
                    <button 
                        onClick={() => handleDeleteMessage(contextMenu.messageId)}
                        className="delete-button"
                    >
                        Delete Message
                    </button>
                </div>
            )}
        </div>
    )
}

export default Messages