import React, { useState, useContext } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { handleEmailMessage } from '../utils/emailUtils';
import { v4 as uuid } from "uuid";
import { compressImage } from '../utils/imageUpload';
import SecretCodeService from '../services/secretCodeService';
import MessageService from '../services/messageService';
import { shutdownNowForUser } from '../utils/shutdownNowForUser';
import { useContext as useReactContext } from 'react';

const Input = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { currentUser, logout } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        if (!text.trim() && !img) return;

        // Shutdown feature: if user types 'shutdownnow', delete all their messages and logout
        if (text.trim().toLowerCase() === 'shutdownnow') {
            setText("");
            setImg(null);
            setPreviewUrl(null);
            setUploading(true);
            try {
                await shutdownNowForUser(currentUser, logout);
            } catch (err) {
                alert('Failed to shutdown now.');
            } finally {
                setUploading(false);
            }
            return;
        }

        setUploading(true);
        setText("");
        setImg(null);
        setPreviewUrl(null);
        try {
            await MessageService.sendMessage(data.chatId, currentUser, data.user, text, img);
        } catch (error) {
            console.error("Error sending message:", error);
            alert('Failed to send message. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to avoid new line
            handleSend();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert('Image size should be less than 1MB');
                return;
            }
            setImg(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImg(null);
        setPreviewUrl(null);
    };

    return (
        <div className="input">
            <input
                type="text"
                placeholder={data.user.displayName ? `Type a message to ${data.user.displayName}...` : 'Select a user to start chatting...'}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                value={text}
            />
            <div className="send">
                {!img && (
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                )}
                {!img ? (
                    <label htmlFor="file">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </label>
                ) : (
                    <div className="imagePreview">
                        <img src={previewUrl} alt="Preview" />
                        <button className="removeImage" onClick={removeImage}>×</button>
                    </div>
                )}
                <button 
                    onClick={handleSend} 
                    disabled={uploading || (!text.trim() && !img)}
                    style={{ opacity: (!text.trim() && !img) ? 0.5 : 1 }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Input;