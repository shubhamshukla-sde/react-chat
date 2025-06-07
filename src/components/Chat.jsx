import React, { useContext, useEffect, useState } from 'react'
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import Messages from './Messages'
import Input from './Input'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Chat = () => {
    const { data, dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            if (data.user?.uid) {
                const userDocRef = doc(db, "users", data.user.uid)
                const userDocSnap = await getDoc(userDocRef)
                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data())
                }
            }
        }

        fetchUserData()
    }, [data.user?.uid])

    const toggleSidebar = () => {
        dispatch({ type: "TOGGLE_SIDEBAR" });
    };

    return (
        <div className='chat'>
            <div className='chatInfo'>
                <span>{user?.displayName}</span>
                <button className="toggle-sidebar" onClick={toggleSidebar}>
                    {data.sidebarVisible ? '←' : (<><span style={{fontSize: '14px', marginRight: '4px'}}>→</span><span style={{fontSize: '12px'}}>All Users</span></>)}
                </button>
            </div>
            <Messages/>
            <Input />
        </div>
    )
}

export default Chat