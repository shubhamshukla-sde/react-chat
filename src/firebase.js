import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDTZXotf5NJ24UVzcGfHQBY6EbFXG0gjPk",
  authDomain: "react-chat-1504b.firebaseapp.com",
  databaseURL: "https://react-chat-1504b-default-rtdb.firebaseio.com",
  projectId: "react-chat-1504b",
  storageBucket: "react-chat-1504b.firebasestorage.app",
  messagingSenderId: "483749109520",
  appId: "1:483749109520:web:c0b11e9c7fb8a9a4628f95",
  measurementId: "G-VDJT5EZDW3"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage();
