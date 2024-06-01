import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GoPeople,  GoPerson  } from "react-icons/go";
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
            <div className="iconContainer" onClick={()=> navigate("/homepage")}>
                <IoHomeOutline className="icon"/>
                <p> Home </p>
            </div>
            <div className="iconContainer" onClick={()=> navigate("/profilepage")}>
                <GoPerson className="icon"/>
                <p> Profile </p>
            </div>
            <div className="iconContainer" onClick={() => navigate("/friendpage")}>
                <GoPeople className="icon"/>
                <p> Friends </p>
            </div>
            {/* <div className="iconContainer" onClick={()=> navigate("/chatpage")}>
                <IoChatbubbleEllipsesOutline className="icon"/>
                <p> Chat </p>
            </div> */}
            <div className="iconContainer" onClick={() => navigate("/settings")}>
                <IoSettingsOutline className="icon"/>
                <p> Settings </p>
            </div>
        </section>
    </nav>
    );
};

