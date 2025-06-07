import React, { useState, useEffect, useContext } from 'react'
import {doc, onSnapshot} from "firebase/firestore"
import {db} from "../firebase"
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'

const Chats = () => {
    const [chats, setChats] = useState([])
    const { currentUser } = useContext(AuthContext)
    const { dispatch } = useContext(ChatContext)

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                setChats(doc.data())
            })

            return () => {
                unsub()
            }
        }

        currentUser.uid && getChats()
    }, [currentUser.uid])

    const handleSelect = (user) => {
        dispatch({ type: "CHANGE_USER", payload: user })
        dispatch({ type: "TOGGLE_SIDEBAR", payload: false })
    }

    return (
        <div className="chats" style={{ height: 'calc(100% - 110px)', overflowY: 'auto' }}>
            {Object.entries(chats || {})?.sort((a, b) => b[1].date - a[1].date).map((chat) => (
                <div
                    className="userChat"
                    key={chat[0]}
                    onClick={() => handleSelect(chat[1].userInfo)}
                >
                    <img src={chat[1].userInfo.photoURL} alt="" />
                    <div className="userChatInfo">
                        <span>{chat[1].userInfo.displayName}</span>
                        <p>{chat[1].lastMessage?.text}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Chats