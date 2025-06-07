import React, {useContext} from 'react'
import Messages from './Messages'
import Input from './Input'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'

const Chat = () => {
    const {currentUser} = useContext(AuthContext)
    const { data, dispatch } = useContext(ChatContext)

    const toggleSidebar = () => {
        dispatch({ type: "TOGGLE_SIDEBAR" });
    };

    return (
        <div className='chat'>
            <div className='chatInfo'>
                <span>{data.user.displayName}</span>
                <button className="toggle-sidebar" onClick={toggleSidebar}>
                    {data.sidebarVisible ? '◀' : '▶'}
                </button>
            </div>
            <Messages/>
            <Input />
        </div>
    )
}

export default Chat