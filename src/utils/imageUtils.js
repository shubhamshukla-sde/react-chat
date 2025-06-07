export const getProfilePicture = (user, currentUserData = null) => {
    if (!user) return "https://ui-avatars.com/api/?name=User&background=random"
    
    // If it's the current user
    if (currentUserData && user.uid === currentUserData.uid) {
        return currentUserData.profilePicture || currentUserData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserData.displayName || 'User')}&background=random`
    }
    
    // For other users
    return user.profilePicture || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`
}

export const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = "https://ui-avatars.com/api/?name=User&background=random"
} 