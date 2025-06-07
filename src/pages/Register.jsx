import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "../firebase"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate, Link } from "react-router-dom"
import { compressImage } from '../utils/imageUpload'

const Register = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false)
    const [profilePic, setProfilePic] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErr(false)
        setErrorMessage("")

        const displayName = e.target[0].value.trim()
        const email = e.target[1].value.trim()
        const password = e.target[2].value

        // Validation
        if (!displayName || !email || !password) {
            setErr(true)
            setErrorMessage("All fields are required")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setErr(true)
            setErrorMessage("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        try {
            // Create user
            const res = await createUserWithEmailAndPassword(auth, email, password)

            // Handle profile picture
            let photoURL = "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random"
            let profilePictureData = null
            
            if (profilePic) {
                try {
                    const compressedImage = await compressImage(profilePic, true)
                    profilePictureData = compressedImage
                } catch (imageError) {
                    console.error("Error handling profile picture:", imageError)
                    // Continue with default avatar if image compression fails
                }
            }

            // Update profile with a short URL
            await updateProfile(res.user, {
                displayName,
                photoURL // Use the default avatar URL for auth profile
            })

            // Create user document with the full profile picture data
            await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName,
                email,
                photoURL, // Store the default avatar URL
                profilePicture: profilePictureData // Store the full profile picture data separately
            })

            // Create user chats document
            await setDoc(doc(db, "userChats", res.user.uid), {})

            navigate("/")
        } catch (err) {
            console.error("Registration error:", err)
            setErr(true)
            if (err.code === 'auth/email-already-in-use') {
                setErrorMessage("Email is already in use")
            } else if (err.code === 'auth/invalid-email') {
                setErrorMessage("Invalid email address")
            } else if (err.code === 'auth/weak-password') {
                setErrorMessage("Password is too weak")
            } else {
                setErrorMessage("Failed to create account. Please try again.")
            }
            setLoading(false)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 512 * 1024) { // 512KB limit for profile pictures
                alert('Profile picture size should be less than 512KB')
                return
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }
            setProfilePic(file)
        }
    }

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Chat App</span>
                <span className="title">Register</span>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="display name" 
                        required
                        minLength={3}
                    />
                    <input 
                        type="email" 
                        placeholder="email" 
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="password" 
                        required
                        minLength={6}
                    />
                    <div className="profilePicContainer">
                        <input
                            type="file"
                            id="profilePic"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                        <label htmlFor="profilePic" className="profilePicLabel">
                            {profilePic ? (
                                <img 
                                    src={URL.createObjectURL(profilePic)} 
                                    alt="Profile Preview" 
                                    className="profilePreview"
                                />
                            ) : (
                                <div className="uploadIcon">
                                    <svg 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path 
                                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                                            stroke="#8da4f1" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                        <path 
                                            d="M17 8L12 3L7 8" 
                                            stroke="#8da4f1" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                        <path 
                                            d="M12 3V15" 
                                            stroke="#8da4f1" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span>Add Profile Picture</span>
                                </div>
                            )}
                        </label>
                    </div>
                    <button disabled={loading}>
                        {loading ? "Creating Account..." : "Sign up"}
                    </button>
                    {err && <span className="error">{errorMessage}</span>}
                </form>
                <p>You do have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    )
}

export default Register