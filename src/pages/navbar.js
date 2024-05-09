import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CgProfile } from "react-icons/cg";
import { IoHomeOutline, IoSettingsOutline, IoChatbubbleEllipsesOutline  } from "react-icons/io5";

import '../style/nav.css';
import cattagramLogo from "../imgs/logo/cattagramLogo.png"

//navbar to use on all pages
export const Navbar = () => {
    const navigate = useNavigate();

    return (
    <nav className="headerNav">
        <img src={cattagramLogo} alt="cattagram logo"/>
        <section className="navigation">
            <div className="iconContainer">
                <IoHomeOutline className="icon" onClick={()=> navigate("/homepage")}/>
                <p> Home </p>
            </div>
            <div className="iconContainer">
                <CgProfile className="icon" onClick={()=> navigate("/profilepage")}/>
                <p> Profile </p>
            </div>
            <div className="iconContainer">
                <IoChatbubbleEllipsesOutline className="icon"/>
                <p> Chat </p>
            </div>
            <div className="iconContainer">
                <IoSettingsOutline className="icon" onClick={() => navigate("/settings")}/>
                <p> Settings </p>
            </div>
        </section>
    </nav>
    );
};

