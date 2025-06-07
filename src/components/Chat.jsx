import React, { useContext, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"
import Messages from './Messages'
import Input from './Input'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { useParams } from 'react-router-dom'

const Chat = () => {
    const { chatId } = useParams()
    const { data, dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [user, setUser] = useState(null)
    const [text, setText] = useState("")
    const [img, setImg] = useState(null)
    const [chatData, setChatData] = useState({})

    useEffect(() => {
        const fetchUserData = async () => {
            if (data?.user?.uid) {
                const docRef = doc(db, "users", data.user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUser(docSnap.data())
                }
            }
        }

        fetchUserData()
    }, [data?.user?.uid])

    useEffect(() => {
        if (!chatId) return

        const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
            if (doc.exists()) {
                setChatData(doc.data())
            }
        })

        return () => {
            unSub()
        }
    }, [chatId])

    const toggleSidebar = () => {
        dispatch({ type: "TOGGLE_SIDEBAR" })
    }

    const handleSend = async () => {
        if (img) {
            // Handle image upload logic here
        } else {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    id: Date.now(),
                    text,
                    senderId: currentUser.uid,
                    date: Timestamp.now()
                })
            })
        }

        // Update last message in userChats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
            [chatId + ".lastMessage"]: {
                text
            },
            [chatId + ".date"]: serverTimestamp()
        })

        await updateDoc(doc(db, "userChats", data.user.uid), {
            [chatId + ".lastMessage"]: {
                text
            },
            [chatId + ".date"]: serverTimestamp()
        })

        setText("")
        setImg(null)
    }

    if (!data?.user) {
        return (
            <div className='chat'>
                <div className="chatInfo">
                    <span>Select a user to start chatting</span>
                </div>
            </div>
        )
    }

    return (
        <div className='chat'>
            <div className='chatInfo'>
                <span>{data.user.displayName}</span>
                <div className="chatIcons">
                    <img src="/img/cam.png" alt="" />
                    <img src="/img/add.png" alt="" />
                    <img src="/img/more.png" alt="" />
                </div>
                <button className="toggle-sidebar" onClick={toggleSidebar}>
                    {data.sidebarVisible ? '←' : (<><span style={{fontSize: '14px', marginRight: '4px'}}>→</span><span style={{fontSize: '12px'}}>All Users</span></>)}
                </button>
            </div>
            <Messages />
            <Input />
        </div>
    )
}

export default Chat