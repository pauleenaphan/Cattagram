import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore"; 

import '../style/acc.css';
import logo from "../imgs/logo/logo.png";
import logoError from "../imgs/logo/invalidLogo.png";
import logoPass from "../imgs/logo/invalidPassLogo.png";
import logoEmail from "../imgs/logo/invalidEmailPass.png";
import shortLogoPass from "../imgs/logo/shortPassLogo.png";
import emailExistLogo from "../imgs/logo/emailExistLogo.png";
import defaultPfp from "../imgs/defaultPfp.png";

import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./userInfo";

export const Login = () =>{
    const navigate = useNavigate(); // Get the navigate function using useNavigate hook
    const {userData, updateUserData} = useContext(UserContext); 
    const [loginStatusPic, setLoginStatusPic] = useState(logo); //shows errors when user can't login

    const setLocalStorage = () =>{
        localStorage.setItem("isLogged", "true");
        localStorage.setItem("userEmail", userData.userEmail);
        localStorage.setItem("userName", userData.userName);
    }

    const getFirebase = async () =>{
        try{
            const doc = await getDoc(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"));
            updateUserData(doc.data().name);
            localStorage.setItem("userDateJoined",  doc.data().dateJoined);
        }catch(error){
            console.log("error ", error);
        }
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        signInWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
            .then(() => {
                updateUserData('userEmail', userData.userEmail);
                updateUserData('userPassword', userData.userPassword);
                getFirebase();
                setLocalStorage();
                navigate("/homepage");
            })
            .catch((error) => {
                console.log("error ", error.code);
                if(error.code === "auth/invalid-email"){
                    setLoginStatusPic(logoError);
                }else if(error.code === "auth/invalid-credential"){
                    setLoginStatusPic(logoError);
                }
            });
    }

    return(
        <div className="loginContainer">
            <section className="header">
                <img src={loginStatusPic} alt="logo"/>
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
            {/* <p> {loginStatus} </p> */}
        </div>
    )
}

export const CreateAccount = ()=>{
    // const auth = getAuth();
    const navigate = useNavigate();
    const {userData, updateUserData} = useContext(UserContext); 
    const [confirmPass, setConfirmPass] = useState("");
    const [loginStatusPic, setLoginStatusPic] = useState(logo); //shows create acc error to user

    const setFirebase = async () => {
        try{
            await addDoc(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"), {
                name: userData.userName,
                pic: defaultPfp,
                profileDesc: "I'm new to cattagram!",
                datejoined: getDate()
            })
        }catch(error){
            console.log("error ", error);
        }

        try{
            await setDoc(doc(db, "Users", localStorage.getItem("userEmail")), {
                placeholder: ""
            })
        }catch(error){
            console.log("error ", error);
        }
    }

    const setLocalStorage = () =>{
        localStorage.setItem("isLogged", "true");
        localStorage.setItem("userEmail", userData.userEmail);
        localStorage.setItem("userName", userData.userName);
        localStorage.setItem("userDateJoined", getDate())
    }

    const handleSubmit = (e) => {
        //prevent form from submitting
        e.preventDefault(); 
        console.log(userData.userEmail, userData.userName, userData.userPassword);

        if(userData.userPassword !== confirmPass){
            setLoginStatusPic(logoPass);
        }else{
            createUserWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
                .then(() =>{
                    // setLoginStatus("Account created successfully");
                    setLocalStorage();
                    setFirebase();
                    navigate("/homepage");
                }).catch((error) =>{ //displays error when the user is creating an account
                    console.log("error ", error.code);
                    if(error.code === "auth/invalid-email"){
                        setLoginStatusPic(logoEmail);
                    }else if(error.code === "auth/weak-password"){
                        setLoginStatusPic(shortLogoPass);
                    }else if(error.code === "auth/email-already-in-use"){
                        setLoginStatusPic(emailExistLogo);
                    }
                })
        }
    };

    return(
        <div className="createContainer">
            <section className="header">
                <img src={loginStatusPic} alt="logo"/>
            </section>
            <form className="createForm" onSubmit={handleSubmit}>
                <input type="text" placeholder="Email" id="userEmail" onChange={(e) => updateUserData('userEmail', e.target.value)}></input>
                <input type="text" placeholder="Name" id="userName" onChange={(e) => updateUserData('userName', e.target.value)}></input>
                <input type="text" placeholder="Password" id="userPass" onChange={(e) => updateUserData('userPassword', e.target.value)}></input>
                <input type="text" placeholder="Confirm Password" id="userConfirmPass" onChange={(e) => setConfirmPass(e.target.value)}></input>
                <button type="submit"> Sign Up</button>
            </form>
            <section className="oldUser">
                <p> Already have an account? </p>
                <button className="signUpBtn" onClick={()=> navigate("/login")}> Sign In </button>
            </section>
        </div>
    )
}

const getDate = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; 
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
};