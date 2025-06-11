import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { ChatContext } from '../context/ChatContext'

const Home = () => {
    const { data } = useContext(ChatContext);

    return (
        <div className='home'>
            <div className='container'>
                <div className={`sidebar ${!data.sidebarVisible ? 'hidden' : ''}`}>
                    <Sidebar/>
                </div>
                <div className="main-content">
                    {data.chatVisible && <Chat/>}
                </div>
            </div>
        </div>
    )
}

export default Home