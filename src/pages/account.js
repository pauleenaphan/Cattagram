import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./userInfo";

export const Login = () =>{
    const navigate = useNavigate(); // Get the navigate function using useNavigate hook

    return(
        <div>
            <section className="header">
                <h1> Cattagram </h1>
                <p> Welcome Back! </p>
            </section>
            <form className="loginForm">
                <input type="text" placeholder="Email" id="userEmail"></input>
                <input type="text" placeholder="Password" id="userPassword"></input>
                <button type="submit"> Login </button>
            </form>
            <section className="newUser">
                <p> Don't have an account? </p>
                {/* ()=> so that the function only goes through when it is being clicked on */}
                <button className="createAccBtn" onClick={()=> navigate("/createAcc")}> Sign up</button>
            </section>
        </div>
    )
}

export const CreateAccount = ()=>{
    // const auth = getAuth();
    const navigate = useNavigate();
    const {userData, updateUserData} = useContext(UserContext); 
    const [confirmPass, setConfirmPass] = useState("");

    const handleSubmit = (e) => {
        //prevent form from submitting
        e.preventDefault(); 
        console.log(userData.userEmail, userData.userPassword);

        if(userData.userPassword !== confirmPass){
            console.log("passwords don't match");
        }else{
            createUserWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
                .then((userCredential) =>{
                    const user = userCredential.user;
                    console.log("user ", user);
                }).catch((error) =>{
                    console.log("error ", error);
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
                <button className="signUpBtn" onClick={()=> navigate("/")}> Sign In </button>
            </section>
        </div>
    )
}