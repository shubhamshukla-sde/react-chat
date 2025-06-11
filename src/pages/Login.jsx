import React, { useState } from 'react'
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate, Link } from 'react-router-dom'
import SecretCodeService from '../services/secretCodeService'

const Login = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("") // State for specific error messages

    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        setErr(false)
        setErrorMessage("")

        const email = e.target[0].value
        const password = e.target[1].value
        const enteredSecretCode = e.target[2].value.trim() // Get secret code from input

        try {
            const res = await signInWithEmailAndPassword(auth, email, password)
            const user = res.user

            // Fetch user data to get the stored secret code hash
            const userDocRef = doc(db, "users", user.uid)
            const userDocSnap = await getDoc(userDocRef)
            const userData = userDocSnap.data()
            const storedSecretCodeHash = userData?.secretCodeHash || null

            // Secret Code Logic
            if (enteredSecretCode) {
                // If user entered a secret code, verify it
                if (storedSecretCodeHash && SecretCodeService.verifySecretCode(enteredSecretCode, storedSecretCodeHash)) {
                    SecretCodeService.setSecretCodeInSession(storedSecretCodeHash) // Store hashed code in session
                } else {
                    // Incorrect secret code
                    setErr(true)
                    setErrorMessage("Incorrect secret code.")
                    setLoading(false)
                    SecretCodeService.removeSecretCodeFromSession() // Clear any old secret code
                    return
                }
            } else {
                // If user did not enter a secret code, ensure none is active in session
                SecretCodeService.removeSecretCodeFromSession()
            }

            navigate("/")
        } catch (error) {
            console.error("Login error:", error)
            setErr(true)
            setLoading(false)
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setErrorMessage("Invalid email or password.")
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage("Invalid email address.")
            } else {
                setErrorMessage("Failed to sign in. Please try again.")
            }
        }
    }

    return (
        <div className='formContainer'>
            <div className='formWrapper'>
                <span className='logo'>React Chat</span><br></br>
                <span className='title'>Login</span><br></br>
                <form onSubmit={handleSubmit}>
                    <input type='email' placeholder='Email'/>
                    <input type='password' placeholder='Password'/>
                    <input 
                        type="password" 
                        placeholder="secret code (optional)" 
                        minLength={4}
                    />
                    <button disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                    {err && <span className="error">{errorMessage}</span>}
                </form>

                <br></br>
                <p>You do not have an account? <Link to="/register">Register</Link></p>
            </div>
        </div>
    )
}

export default Login