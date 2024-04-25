import React, { useEffect } from "react";
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