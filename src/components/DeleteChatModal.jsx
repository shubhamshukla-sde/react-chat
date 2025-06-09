import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { deleteChatWithUser } from '../utils/chatUtils';

const DeleteChatModal = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const { dispatch } = useContext(ChatContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const querySnapshot = await getDocs(usersRef);
                const usersList = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUser.uid); // Exclude current user
                setUsers(usersList);
            } catch (error) {
                console.error('Error fetching users for delete modal:', error);
            }
        };

        fetchUsers();
    }, [currentUser.uid]);

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            await deleteChatWithUser(currentUser.uid, selectedUser);
            dispatch({ type: "RESET_CHAT" });
            onClose(); // Close the modal after deletion
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete chat. Please try again.');
        }
    };

    const selectedUserName = users.find(u => u.id === selectedUser)?.displayName;

    return (
        <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
                {!showConfirm ? (
                    <>
                        <p>Select a user to delete the chat history with:</p>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="user-select"
                        >
                            <option value="">Select user</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.displayName}
                                </option>
                            ))}
                        </select>
                        <div className="delete-confirm-buttons">
                            <button onClick={onClose}>Cancel</button>
                            <button 
                                onClick={() => selectedUser && setShowConfirm(true)}
                                disabled={!selectedUser}
                                className="confirm-delete"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p>Are you sure you want to delete all messages with {selectedUserName}?</p>
                        <div className="delete-confirm-buttons">
                            <button onClick={() => setShowConfirm(false)}>Back</button>
                            <button onClick={handleDelete} className="confirm-delete">
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeleteChatModal; 