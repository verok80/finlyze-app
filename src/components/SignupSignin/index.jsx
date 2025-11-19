import React, { useState } from 'react';
import './styles.css';
import Input from '../Input';
import Button from '../Button';
import { createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         signInWithPopup,
        GoogleAuthProvider } from "firebase/auth";
import { auth, db , provider } from '../../firebase';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc} from "firebase/firestore";


function SignupSignin(){
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [logingForm, setLogingForm] = useState(false);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   function signupWithEmail(e){
     e.preventDefault();
    setLoading(true);
        //Authentication of the user, or creating a new account using email and password
       if(name!=="" && email!=="" && password!=="" && confirmPassword!==""){
        if(password === confirmPassword){
           createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log("User>>>", user);
    toast.success("UserCreated!")
     setLoading(false);
     setName("");
     setPassword("");
     setEmail("");
     setConfirmPassword("");
    // Creating a document with user id as the following id
    createDoc(user);
    navigate("/dashboard");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    toast.error(errorMessage);
    // ..
  });
    }else{
        toast.error("password and Confirm Password don't match!");
        setLoading(false);
    }
       }else{
        toast.error("All fields are mandatory");
        setLoading(false);
       
      }
   }
function loginUsingEmail(e){
   e.preventDefault();
        console.log("Email", email);
         console.log("Password", password);
         setLoading(true);
          if( email.trim()!=="" && password.trim()!==""){
            signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    toast.success("User Logged In!");
    console.log("User Logged In", user);
    setLoading(false);
     navigate("/dashboard");
   
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
     setLoading(false);
    toast.error (errorMessage);
  });
     } else{
        toast.error("Allfields are mandatory!");
         setLoading(false);
       }
}
async function createDoc(user){
    setLoading(true);
        // Make sure that the doc with the uid doesn't exist
        // Create doc
        if(!user) return;

        const useRef = doc(db, "users", user.uid);
        const userData = await getDoc(useRef);

        if(!userData.exists()){
        
        try{
        await setDoc(doc(db, "users", user.uid ),{ 
           name: user.displayName ? user.displayName : name,
           email: user.email,
           photoURL: user.photoURL ? user.photoURL : "",
           createdAt: new Date(),
        });
        toast.success("Doc created!");
        setLoading(false);
    } catch (e) {
   toast.error(e.message);
   setLoading(false);
    }
      } else {
        toast.error("Doc already exists");
      }
    }

function googleAuth(){
    setLoading(true);
    try{
     signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log("user>>>", user);
    createDoc(user);
    setLoading(false);
    navigate("/dashboard");
    toast.success("User authenticated!");
    // data available using getAdditionalUserInfo(result)
    
  }).catch((error) => {
     setLoading(false);
    // Handle Errors 
    const errorCode = error.code;
    const errorMessage = error.message;
    toast.error(errorMessage);
    // The email of the user's account used.
    
  });
    } catch(e){
        toast.error(e.message);
    }
    }


    return(
    <>
    {logingForm ? (
        <div className='signup-wrapper'>
        <h2 className='title'>
        Login on <span style={{color: "var(--theme"}}>Finlyze.</span></h2>
      <form>
          <Input  label={"Email"}
          type="email"
          state={email} 
          setState={setEmail}
          placeholder={"JohnSmith@gmail.com"}
          />

          <Input  label={"Password"}
          type="password"
          state={password} 
          setState={setPassword}
          placeholder={"Example@123"} 
          />

         <Button
         disabled={loading}
          text={loading ? "Loading..." : "Login Using Email and Password"}
          onClick={loginUsingEmail}
            />
            <p className='p-login'>or</p>
          <Button 
          onClick={googleAuth}
          text={loading ? "Loading..." : "Login Using Google"} blue={true}/>
          <p className='p-login' 
          style={{ cursor: "pointer"}}
          onClick={()=>setLogingForm(!logingForm)}>

            Or Don't  Have an Account Already? Click Here</p>
      </form>
     </div>

    ) : (

    <div className='signup-wrapper'>
        
      <h2 className='title'>Sign Up on <span style={{color: "var(--theme"}}>Finlyze.</span></h2>
      <form>
        <Input  
         label={"Full Name"}
         state={name} 
         setState={setName}
         placeholder={"John Smith"} 
        />

          <Input  
          label={"Email"}
          type="email"
          state={email} 
          setState={setEmail}
          placeholder={"JohnSmith@gmail.com"}
          />

          <Input  
          label={"Password"}
          type="password"
          state={password} 
          setState={setPassword}
          placeholder={"Example@123"}
         />

          <Input  label={"Confirm password"}
          type="password"
          state={confirmPassword} 
          setState={confirmPassword}
          placeholder={"Example@123"} 
          />

         <Button
          disabled={loading}
          text={loading ? "Loading..." : "Signup Using Email and Password"}
          onClick={signupWithEmail}
          />
            <p className='p-login'>or</p>
          <Button
            onClick={googleAuth}
           text={loading ? "Loading..." : "Signup Using Google"} blue={true}/>
           <p className='p-login'
            style={{ cursor: "pointer"}}
          onClick={()=>setLogingForm(!logingForm)}
           >Or Have an Account Already? Click Here</p>
      </form>
     
    </div>
    )}
    </>
    );
   }

export default SignupSignin;
