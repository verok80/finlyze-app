import React, { useEffect } from 'react';
import './styles.css';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import userImg from '../../assets/user1.png'

function Header(){

    const [user, loading ] = useAuthState(auth);
    const navigate = useNavigate();

    function logoutFnc() {
        try{
    signOut(auth).then(() => {
        toast.success("Logged Out Successfully!!")
      navigate("/");
      }).catch((error) => {
   toast.error(error.message);
      });
        } catch (e){
    toast.error (e.message)
        }
      
    }

    useEffect(() => {
        if(user){
            navigate("/dashboard")
        }
    }, [user, loading]);

    return<div className='navbar'>
        <p className='logo'>Finlyze.</p>
        {user && (
            <div style={{display: "flex",
               alignItems: "center",
               gap: "0.75rem"
            }}>
                <img src={user.photoURL ? user.photoURL : userImg}  style={{borderRadius: "50%", height:"2rem", width:"2rem", }} />
        <p className='logo link' onClick={logoutFnc}>Logout</p>
        </div>
        )}
    </div>
}
export default Header;