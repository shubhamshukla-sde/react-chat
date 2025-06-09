import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const deleteChatWithUser = async (currentUserId, otherUserId) => {
    try {
        // Get the combined chat ID
        const combinedId = currentUserId > otherUserId
            ? currentUserId + otherUserId
            : otherUserId + currentUserId;

        // Delete the chat document
        await deleteDoc(doc(db, "chats", combinedId));

        // Remove chat from current user's userChats
        const currentUserChatsRef = doc(db, "userChats", currentUserId);
        const currentUserChatsDoc = await getDoc(currentUserChatsRef);
        if (currentUserChatsDoc.exists()) {
            const currentUserChats = currentUserChatsDoc.data();
            delete currentUserChats[combinedId];
            await updateDoc(currentUserChatsRef, currentUserChats);
        }

        // Remove chat from other user's userChats
        const otherUserChatsRef = doc(db, "userChats", otherUserId);
        const otherUserChatsDoc = await getDoc(otherUserChatsRef);
        if (otherUserChatsDoc.exists()) {
            const otherUserChats = otherUserChatsDoc.data();
            delete otherUserChats[combinedId];
            await updateDoc(otherUserChatsRef, otherUserChats);
        }

        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}; 