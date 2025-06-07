import React, { useState, useContext } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { handleEmailMessage } from '../utils/emailUtils';

const Input = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);

    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        if (text.trim() === "" && !img) return;

        try {
            // Check if it's an email message
            const isEmailMessage = await handleEmailMessage(text, currentUser, data.chatId, data);
            
            if (!isEmailMessage) {
                // Regular message handling
                await updateDoc(doc(db, "chats", data.chatId), {
                    messages: arrayUnion({
                        id: Date.now(),
                        text,
                        senderId: currentUser.uid,
                        date: Timestamp.now()
                    })
                });

                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [data.chatId + ".lastMessage"]: {
                        text
                    },
                    [data.chatId + ".date"]: serverTimestamp()
                });

                await updateDoc(doc(db, "userChats", data.user.uid), {
                    [data.chatId + ".lastMessage"]: {
                        text
                    },
                    [data.chatId + ".date"]: serverTimestamp()
                });
            }

            setText("");
            setImg(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="input">
            <input
                type="text"
                placeholder="Type something..."
                onChange={e => setText(e.target.value)}
                value={text}
            />
            <div className="send">
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Input;