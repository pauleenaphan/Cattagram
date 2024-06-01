import React, { useContext, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc, getDoc ,getDocs } from "firebase/firestore"; 

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
import { getDate } from './helpers.js';

import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export const Login = () =>{
    const navigate = useNavigate(); // Get the navigate function using useNavigate hook
    const {userData, updateUserData} = useContext(UserContext); 
    const [loginStatusPic, setLoginStatusPic] = useState(logo); //shows errors when user can't login
    const [showPassword, setShowPassword] = useState(false); //state to toggle password visibility

    const setLocalStorage = async () => {
        localStorage.setItem("isLogged", "true");
        localStorage.setItem("userEmail", userData.userEmail);
        try {
            const querySnapshot = await getDocs(collection(db, "Users", userData.userEmail, "userInfo"));
            const docSnap = await getDoc(querySnapshot.docs[0].ref);

            localStorage.setItem("userName", docSnap.data().name);
            localStorage.setItem("userDateJoined", docSnap.data().datejoined);
            localStorage.setItem("userPfp", docSnap.data().pic)
        } catch (error) {
            console.log("error ", error);
        }
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        signInWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
            .then(() => {
                updateUserData('userEmail', userData.userEmail);
                updateUserData('userPassword', userData.userPassword);
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
                <div className="passContainer">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" id="userPassword" onChange={(e) => updateUserData('userPassword', e.target.value)}></input>
                    {showPassword ? <IoEyeOffOutline class="eyeIcon" onClick={() => setShowPassword(false)} /> : <IoEyeOutline class="eyeIcon" onClick={() => setShowPassword(true)} />}
                </div>
                
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

export const CreateAccount = () => {
    const navigate = useNavigate();
    const {userData, updateUserData} = useContext(UserContext); 
    const [confirmPass, setConfirmPass] = useState("");
    const [loginStatusPic, setLoginStatusPic] = useState(logo);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const setFirebase = async () => {
        try {
            await addDoc(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"), {
                name: userData.userName,
                pic: defaultPfp,
                profileDesc: "I'm new to cattagram!",
                datejoined: getDate()
            });
            await setDoc(doc(db, "Users", localStorage.getItem("userEmail")), {
                placeholder: ""
            });
        } catch(error) {
            console.log("error ", error);
        }
    };

    const setLocalStorage = () => {
        localStorage.setItem("isLogged", "true");
        localStorage.setItem("userEmail", userData.userEmail);
        localStorage.setItem("userName", userData.userName);
        localStorage.setItem("userPfp", defaultPfp);
        localStorage.setItem("userDateJoined", getDate());
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 

        if (userData.userPassword !== confirmPass) {
            setLoginStatusPic(logoPass);
        } else {
            createUserWithEmailAndPassword(auth, userData.userEmail, userData.userPassword)
                .then(() =>{
                    setLocalStorage();
                    setFirebase();
                    navigate("/homepage");
                }).catch((error) => {
                    console.log("error ", error.code);
                    if(error.code === "auth/invalid-email"){
                        setLoginStatusPic(logoEmail);
                    } else if(error.code === "auth/weak-password"){
                        setLoginStatusPic(shortLogoPass);
                    } else if(error.code === "auth/email-already-in-use"){
                        setLoginStatusPic(emailExistLogo);
                    }
                });
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
                <div className="passContainer">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        id="userPass" 
                        onChange={(e) => updateUserData('userPassword', e.target.value)}
                    ></input>
                    {showPassword ? <IoEyeOffOutline class="eyeIcon" onClick={() => setShowPassword(false)} /> : <IoEyeOutline class="eyeIcon" onClick={() => setShowPassword(true)} />}
                </div>
                <div className="passContainer">
                    <input 
                        type={showConfirmPass ? "text" : "password"} 
                        placeholder="Confirm Password" 
                        id="userConfirmPass" 
                        onChange={(e) => setConfirmPass(e.target.value)}
                    ></input>
                    {showConfirmPass ? <IoEyeOffOutline class="eyeIcon" onClick={() => setShowConfirmPass(false)} /> : <IoEyeOutline class="eyeIcon" onClick={() => setShowConfirmPass(true)} />}
                </div>
                
                <button type="submit"> Sign Up</button>
            </form>
            <section className="oldUser">
                <p> Already have an account? </p>
                <button className="signUpBtn" onClick={() => navigate("/login")}> Sign In </button>
            </section>
        </div>
    )
};
