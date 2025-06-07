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
                    {data.sidebarVisible ? '←' : (<><span style={{fontSize: '14px', marginRight: '4px'}}>→</span><span style={{fontSize: '12px'}}>All Users</span></>)}
                </button>
            </div>
            <Messages/>
            <Input />
        </div>
    )
}

export default Chat