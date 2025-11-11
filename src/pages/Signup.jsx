import React from 'react';
import Header from  '../components/Header';
import SignupSigninComponent from '../components/SignupSignin';

function Signup(){
    return<>
        <Header/>
        <div className='wrapper'>
            <SignupSigninComponent/>
        </div>
    </>
}
export default Signup;