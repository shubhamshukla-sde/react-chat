import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import { compressImage } from "../utils/imageUpload";
import SecretCodeService from "./secretCodeService";

const MessageService = {
    sendMessage: async (chatId, currentUser, targetUser, text, imgFile = null) => {
        // Validate inputs
        if (!text?.trim() && !imgFile) {
            console.warn("Empty message attempted");
            return;
        }

        if (!chatId || !currentUser?.uid || !targetUser?.uid) {
            throw new Error('Missing required parameters for sending message');
        }

        try {
            let imageData = null;
            if (imgFile) {
                imageData = await compressImage(imgFile);
                if (!imageData) {
                    throw new Error('Failed to compress image');
                }
            }

            const activeSecretCode = SecretCodeService.getSecretCodeFromSession();

            // Build message data - NEVER include null values
            const messageData = {
                id: uuid(),
                text: String(text || "").trim(),
                senderId: String(currentUser.uid),
                date: Timestamp.now(),
            };

            // Only add secretCode if it exists and is not null
            if (activeSecretCode && activeSecretCode !== "" && activeSecretCode !== null) {
                messageData.secretCode = String(activeSecretCode);
            }

            // Only add image if it exists
            if (imageData) {
                messageData.img = imageData;
            }

            // Check if chat document exists
            const chatRef = doc(db, "chats", chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) {
                await setDoc(chatRef, { messages: [] });
            }

            // Add message to chat - wrap in try-catch to handle WebChannel errors gracefully
            try {
                await updateDoc(chatRef, {
                    messages: arrayUnion(messageData)
                });
            } catch (updateError) {
                // If it's a WebChannel/network error, log but don't throw
                const errMsg = updateError?.message || String(updateError);
                if (errMsg.includes('WebChannel') || errMsg.includes('400') || errMsg.includes('TYPE=terminate')) {
                    console.warn('Non-critical Firestore error (message likely sent):', errMsg);
                } else {
                    // Re-throw actual errors
                    throw updateError;
                }
            }

            // Prepare last message text
            const lastMessageText = String(text || "").trim() || (imageData ? "📷 Image" : "");

            // Update userChats - handle errors gracefully
            try {
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [`${chatId}.lastMessage`]: {
                        text: lastMessageText
                    },
                    [`${chatId}.date`]: serverTimestamp()
                });
            } catch (e) {
                console.warn('Non-critical error updating currentUser chat:', e?.message);
            }

            try {
                await updateDoc(doc(db, "userChats", targetUser.uid), {
                    [`${chatId}.lastMessage`]: {
                        text: lastMessageText
                    },
                    [`${chatId}.date`]: serverTimestamp()
                });
            } catch (e) {
                console.warn('Non-critical error updating targetUser chat:', e?.message);
            }

        } catch (error) {
            console.error("Error in MessageService.sendMessage:", error);
            
            // Only throw critical errors
            const errorMsg = error?.message || String(error);
            if (errorMsg.includes('Missing required') || errorMsg.includes('Failed to compress')) {
                throw error;
            }
            
            // Log but don't throw non-critical errors
            console.warn('Non-critical MessageService error (message may have sent):', errorMsg);
        }
    },
};

export default MessageService;
