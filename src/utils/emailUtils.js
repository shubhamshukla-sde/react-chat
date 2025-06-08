import { doc, updateDoc, arrayUnion, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init("CCQ_X68RBFnWWCN9d"); // You'll need to replace this with your actual EmailJS public key

export const handleEmailMessage = async (text, currentUser, chatId, data) => {
    // Match email pattern in the message
    const emailMatch = text.match(/send mail to ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (!emailMatch) return false;

    const emailAddress = emailMatch[1];
    
    try {
        // Check if the email belongs to a registered user
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", emailAddress));
        //const querySnapshot = await getDocs(q);
        
        // if (querySnapshot.empty) {
        //     throw new Error("This email is not registered in our system: " + emailAddress);
        // }

        // Get the user document
        //const userDoc = querySnapshot.docs[0];
        //console.log("Found user document:", userDoc.data());

        // Send email using EmailJS
        const templateParams = {
            to_email: emailAddress,
            //from_name: currentUser.displayName,
            message: `You have received a message to verify your application.`,
            //reply_to: currentUser.email
        };

        await emailjs.send(
            'service_u0nafyd', // Replace with your EmailJS service ID
            'template_kmuxm4j', // Replace with your EmailJS template ID
            templateParams
        );

        // Add confirmation message to chat
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                id: Date.now(),
                text: `Email has been sent to ${emailAddress}.`,
                senderId: "system",
                date: Timestamp.now()
            })
        });

        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        
        // Add error message to chat
        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                id: Date.now(),
                text: `Error sending email: ${error.message}`,
                senderId: "system",
                date: Timestamp.now()
            })
        });

        return false;
    }
};