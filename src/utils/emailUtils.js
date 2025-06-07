import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";

export const handleEmailMessage = async (text, currentUser, chatId, data) => {
    // Match email pattern in the message
    const emailMatch = text.match(/send mail to ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (!emailMatch) return false;

    const emailAddress = emailMatch[1];
    
    try {
        // Store the email in user's document
        await updateDoc(doc(db, "users", currentUser.uid), {
            email: emailAddress
        });

        // Send verification email using Firebase Auth
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser, {
                url: window.location.origin, // URL to redirect after verification
                handleCodeInApp: true
            });
        }

        // Add confirmation message to chat
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                id: Date.now(),
                text: `Verification email has been sent to ${emailAddress}. Please check your inbox and verify your email.`,
                senderId: "system",
                date: Timestamp.now()
            })
        });

        return true;
    } catch (error) {
        console.error("Error setting up email:", error);
        
        // Add error message to chat
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                id: Date.now(),
                text: `Error sending verification email: ${error.message}`,
                senderId: "system",
                date: Timestamp.now()
            })
        });

        return false;
    }
};