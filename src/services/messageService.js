import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import { compressImage } from "../utils/imageUpload";
import SecretCodeService from "./secretCodeService";

const MessageService = {
    sendMessage: async (chatId, currentUser, targetUser, text, imgFile = null) => {
        if (!text.trim() && !imgFile) return;

        let imageData = null;
        if (imgFile) {
            imageData = await compressImage(imgFile);
            if (!imageData) {
                throw new Error('Failed to compress image');
            }
        }

        const activeSecretCode = SecretCodeService.getSecretCodeFromSession();

        const messageData = {
            id: uuid(),
            text: text.trim(),
            senderId: currentUser.uid,
            date: Timestamp.now(),
            secretCode: activeSecretCode || null, // Store the secret code with the message
        };

        if (imageData) {
            messageData.img = imageData;
        }

        // Check if chat document exists
        const chatRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            // Create new chat document if it doesn't exist
            await setDoc(chatRef, { messages: [] });
        }

        // Add message to chat
        await updateDoc(chatRef, {
            messages: arrayUnion(messageData)
        });

        // Update last message in userChats for current user
        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [chatId + ".lastMessage"]: {
                text: text.trim()
            },
            [chatId + ".date"]: serverTimestamp()
        });

        // Update last message in userChats for target user
        await updateDoc(doc(db, "userChats", targetUser.uid), {
            [chatId + ".lastMessage"]: {
                text: text.trim()
            },
            [chatId + ".date"]: serverTimestamp()
        });
    },

    // No direct fetchMessages here as it's handled by onSnapshot in Messages.jsx
    // The filtering logic based on secret code will be in Messages.jsx
};

export default MessageService; 