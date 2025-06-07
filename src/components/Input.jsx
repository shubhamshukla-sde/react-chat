import React, { useState, useEffect, useContext } from 'react'
import {doc, onSnapshot} from "firebase/firestore"
import {db} from "../firebase"
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { Timestamp, arrayUnion, updateDoc } from 'firebase/firestore'
import {v4 as uuid} from "uuid"
import { compressImage } from '../utils/imageUpload'

const Input = () => {
    const {currentUser} = useContext(AuthContext)
    const { data } = useContext(ChatContext)
    const [text, setText] = useState("")
    const [img, setImg] = useState(null)
    const [uploading, setUploading] = useState(false)

    const handleSend = async () => {
        if (!text.trim() && !img) return

        setUploading(true)
        try {
            let imageData = null
            if (img) {
                imageData = await compressImage(img)
                if (!imageData) {
                    throw new Error('Failed to compress image')
                }
            }

            const messageData = {
                id: uuid(),
                text: text.trim(),
                senderId: currentUser.uid,
                date: Timestamp.now(),
            }

            if (imageData) {
                messageData.img = imageData
            }

            await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayUnion(messageData)
            })

            setText("")
            setImg(null)
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert('Image size should be less than 1MB')
                return
            }
            setImg(file)
        }
    }

    return (
        <div className='input'>
            <input 
                type='text' 
                placeholder={data.user.displayName ? `Type a message to ${data.user.displayName}...` : 'Select a user to start chatting...'}
                onChange={e=>setText(e.target.value)} 
                value={text}
            />
            <div className='send'>
                <input
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                    accept="image/*"
                />
                <label htmlFor="file" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                            stroke="#8da4f1" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <path 
                            d="M17 8L12 3L7 8" 
                            stroke="#8da4f1" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <path 
                            d="M12 3V15" 
                            stroke="#8da4f1" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </label>
                {img && (
                    <div className="imagePreview">
                        <img src={URL.createObjectURL(img)} alt="Preview" style={{ maxHeight: '50px', borderRadius: '5px' }} />
                        <button 
                            onClick={() => setImg(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff4d4d',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '0 5px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                <button 
                    onClick={handleSend} 
                    disabled={uploading || (!text.trim() && !img)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: uploading || (!text.trim() && !img) ? '#b8c4e9' : '#8da4f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: uploading || (!text.trim() && !img) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    {uploading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    )
}

export default Input