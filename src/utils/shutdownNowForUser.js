import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function shutdownNowForUser(user, logout) {
  // 1. Get all chats
  const chatsSnapshot = await getDocs(collection(db, 'chats'));
  const userId = user.uid;

  // 2. For each chat, remove all messages sent by this user
  const updatePromises = chatsSnapshot.docs.map(async (chatDoc) => {
    const chatData = chatDoc.data();
    if (!chatData.messages) return;
    const filteredMessages = chatData.messages.filter(m => m.senderId !== userId);
    if (filteredMessages.length !== chatData.messages.length) {
      // Only update if something was removed
      await updateDoc(doc(db, 'chats', chatDoc.id), { messages: filteredMessages });
    }
  });
  await Promise.all(updatePromises);

  // 3. Log out the user
  await logout();
} 