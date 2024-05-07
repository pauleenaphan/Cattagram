import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CgProfile } from "react-icons/cg";
import { IoHomeOutline, IoSettingsOutline, IoChatbubbleEllipsesOutline  } from "react-icons/io5";

import '../style/nav.css';

//navbar to use on all pages
export const Navbar = () => {
    const navigate = useNavigate();

    return (
    <nav className="headerNav">
        <h1> Cattagram </h1>
        <section className="navigation">
            <IoHomeOutline className="icon" onClick={()=> navigate("/homepage")}/>
            <CgProfile className="icon" onClick={()=> navigate("/profilepage")}/>
            <IoChatbubbleEllipsesOutline className="icon"/>
            <IoSettingsOutline className="icon" onClick={() => navigate("/settings")}/>
        </section>
    </nav>
    );
};

