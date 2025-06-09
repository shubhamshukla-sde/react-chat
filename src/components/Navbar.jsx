import React, { useContext, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import DeleteChatModal from './DeleteChatModal';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
    };

    // Placeholder for delete chat logic (will be implemented later)
    const handleDeleteChatClick = () => {
        setShowDeleteModal(true);
        // More logic to select user will go here
    };

    return (
        <div className="navbar">
            <span className="logo">Chat Us</span>
            <div className="user">
                <img src={currentUser.photoURL || 'https://via.placeholder.com/150'} alt="" />
                <span>{currentUser.displayName}</span>
                <button onClick={handleDeleteChatClick}>Delete Chat</button>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {showDeleteModal && <DeleteChatModal onClose={() => setShowDeleteModal(false)} />}
        </div>
    );
};

export default Navbar;