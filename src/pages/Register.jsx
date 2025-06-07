import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {auth, db} from "../firebase"
import {doc, setDoc} from "firebase/firestore"
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;

        try {
          //Create user
          const res = await createUserWithEmailAndPassword(auth, email, password);
    
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: defaultAvatar,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: defaultAvatar,
            });

            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/")
          } catch (err) {
            console.log(err);
            setErr(true);
            setLoading(false);
          }
        } catch (err) {
          console.log(err)
          setErr(true);
          setLoading(false);
        }
    };

    return (
        <div className='formContainer'>
            <div className='formWrapper'>
                <span className='logo'>React Chat</span><br></br>
                <span className='title'>Register</span><br></br>
                <form onSubmit={handleSubmit}>
                    <input type='text' placeholder='Display name'/>
                    <input type='email' placeholder='Email'/>
                    <input type='password' placeholder='Password'/>
                    <button>Sign up</button>
                </form>

                <br></br>
                <p><Link to="/login">Login?</Link></p>
            </div>
        </div>
    )
}

export default Register