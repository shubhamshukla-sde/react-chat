import React, { useContext, useEffect, useRef, useState } from 'react'
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import Messages from './Messages'
import Input from './Input'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import LocationInfo from './LocationInfo'

const Chat = () => {
    const { data, dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)
    const [user, setUser] = useState(null)
    const [showLocationInfo, setShowLocationInfo] = useState(false)
    const locationInfoRef = useRef(null);
    const locationIconRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                locationInfoRef.current && 
                !locationInfoRef.current.contains(event.target) &&
                locationIconRef.current &&
                !locationIconRef.current.contains(event.target)
            ) {
                setShowLocationInfo(false);
            }
        };

        if (showLocationInfo) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLocationInfo]);

    const toggleSidebar = () => {
        dispatch({ type: "TOGGLE_SIDEBAR" });
    };

    const toggleLocationInfo = () => {
        setShowLocationInfo(!showLocationInfo);
    };

    return (
        <div className='chat'>
            <div className='chatInfo'>
                <span>{user?.displayName}</span>
                <div className="chat-actions">
                    {!data.sidebarVisible && (
                        <button 
                            className={`location-icon ${showLocationInfo ? 'active' : ''}`}
                            onClick={toggleLocationInfo}
                            title={showLocationInfo ? "Hide Location Info" : "Show Location Info"}
                            ref={locationIconRef}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                                <circle cx="12" cy="9" r="2.5"/>
                            </svg>
                        </button>
                    )}
                    <button className="toggle-sidebar" onClick={toggleSidebar}>
                        {data.sidebarVisible ? '←' : (<><span style={{fontSize: '14px', marginRight: '4px'}}>→</span><span style={{fontSize: '12px'}}>All Users</span></>)}
                    </button>
                </div>
            </div>
            {data.isDeleting ? (
                <div className="deleting-indicator">Deleting messages...</div>
            ) : (
                <>
                    <Messages/>
                    <Input />
                    {showLocationInfo && (
                        <div className="location-info-container" ref={locationInfoRef}>
                            <LocationInfo />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Chat