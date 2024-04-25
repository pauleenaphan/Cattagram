import React from "react";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    return(
        <div>
            <section className="header">
                <h1> Cattagram </h1>
            </section>
            <form className="createForm">
                <input type="text" placeholder="Email" id="userEmail"></input>
                <input type="text" placeholder="Name" id="userName"></input>
                <input type="text" placeholder="Passworrd" id="userPass"></input>
                <input type="text" placeholder="Confirm Password" id="userConfirmPass"></input>
                <button type="submit"> Sign Up</button>
            </form>
            <section className="oldUser">
                <p> Already have an account? </p>
                <button className="signUpBtn" onClick={()=> navigate("/")}> Sign In </button>
            </section>
        </div>
    )
}