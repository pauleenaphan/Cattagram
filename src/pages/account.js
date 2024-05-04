import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./userInfo";

export const Login = () =>{
    const navigate = useNavigate(); // Get the navigate function using useNavigate hook
    const {userData, updateUserData} = useContext(UserContext); 
    const [loginStatus, setLoginStatus] = useState(""); //shows errors when user can't login

    const handleSubmit = (e) =>{
        e.preventDefault();
        signInWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                updateUserData('userEmail', userData.userEmail);
                updateUserData('userPassword', userData.userPassword);
                setLoginStatus("Login Successfully!");
                navigate("/homepage");
                localStorage.setItem("isLogged", "true");
            })
            .catch((error) => {
                console.log("error ", error.code);
                if(error.code === "auth/invalid-credential"){
                    setLoginStatus("Invalid email or password");
                }
            });
    }

    return(
        <div>
            <section className="header">
                <h1> Cattagram </h1>
                <p> Welcome Back! </p>
            </section>
            <form className="loginForm" onSubmit={handleSubmit}>
                <input type="text" placeholder="Email" id="userEmail" onChange={(e) => updateUserData('userEmail', e.target.value)}></input>
                <input type="text" placeholder="Password" id="userPassword" onChange={(e) => updateUserData('userPassword', e.target.value)}></input>
                <button type="submit"> Login </button>
            </form>
            <section className="newUser">
                <p> Don't have an account? </p>
                {/* ()=> so that the function only goes through when it is being clicked on */}
                <button className="createAccBtn" onClick={()=> navigate("/createAcc")}> Sign up</button>
            </section>
            <p> {loginStatus} </p>
        </div>
    )
}

export const CreateAccount = ()=>{
    // const auth = getAuth();
    const navigate = useNavigate();
    const {userData, updateUserData} = useContext(UserContext); 
    const [confirmPass, setConfirmPass] = useState("");
    const [loginStatus, setLoginStatus] = useState(""); //shows create acc error to user

    const handleSubmit = (e) => {
        //prevent form from submitting
        e.preventDefault(); 
        console.log(userData.userEmail, userData.userPassword);

        if(userData.userPassword !== confirmPass){
            setLoginStatus("Passwords don't match");
        }else{
            createUserWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
                .then((userCredential) =>{
                    const user = userCredential.user;
                    setLoginStatus("Account created successfully");
                    navigate("/homepage");
                    localStorage.setItem("isLogged", "true");
                }).catch((error) =>{ //displays error when the user is creating an account
                    console.log("error ", error.code);
                    if(error.code === "auth/invalid-email"){
                        setLoginStatus("Invalid Email");
                    }else if(error.code === "auth/weak-password"){
                        setLoginStatus("Password must be at least 6 characters");
                    }else if(error.code === "auth/email-already-in-use"){
                        setLoginStatus("Account already exist with this email");
                    }
                })
        }
    };

    return(
        <div>
            <section className="header">
                <h1> Cattagram </h1>
            </section>
            <form className="createForm" onSubmit={handleSubmit}>
                <input type="text" placeholder="Email" id="userEmail" onChange={(e) => updateUserData('userEmail', e.target.value)}></input>
                <input type="text" placeholder="Name" id="userName" onChange={(e) => updateUserData('userName', e.target.value)}></input>
                <input type="text" placeholder="Passworrd" id="userPass" onChange={(e) => updateUserData('userPassword', e.target.value)}></input>
                <input type="text" placeholder="Confirm Password" id="userConfirmPass" onChange={(e) => setConfirmPass(e.target.value)}></input>
                <button type="submit"> Sign Up</button>
            </form>
            <section className="oldUser">
                <p> Already have an account? </p>
                <button className="signUpBtn" onClick={()=> navigate("/login")}> Sign In </button>
            </section>
            <p> {loginStatus} </p>
        </div>
    )
}