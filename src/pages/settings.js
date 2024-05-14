import React from 'react';
import { useNavigate } from "react-router-dom";
// import { Navbar } from './navbar';
import '../style/settings.css';

export const Settings = () =>{
    const navigate = useNavigate(); 

    const logout = ()=>{
        //indicates that the user is logged out
        localStorage.setItem("isLogged", "false"); 
        navigate("/createAcc");
    }

    return(
        <div className="settingsContainer">
            {/* <Navbar/> */}
            <h1> WE IN SETTINGS </h1>
            <button onClick={()=>{ logout() }}> Log Out </button>
        </div>
    )
}