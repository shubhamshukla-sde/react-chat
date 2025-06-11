import React from 'react'
import Navbar from './Navbar'
import Chats from "./chats"

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <Navbar/>
            <Chats/>
        </div>
    )
}

export default Sidebar