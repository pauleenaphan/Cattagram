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
            <IoHomeOutline className="icon" onClick={()=> navigate("/homepage")}/>
            <CgProfile className="icon" onClick={()=> navigate("/profilepage")}/>
            <IoChatbubbleEllipsesOutline className="icon"/>
            <IoSettingsOutline className="icon" onClick={() => navigate("/settings")}/>
        </section>
    </nav>
    );
};

