import React from 'react';
import { useNavigate } from 'react-router-dom';

//navbar to use on all pages
export const Navbar = () => {
    const navigate = useNavigate();

    return (
    <nav className="headerNav">
        <h1> Cattagram </h1>
        <div onClick={()=> navigate("/homepage")}> Home </div>
        <div> Profile </div>
        <div> Chat </div>
        <div onClick={() => navigate("/settings")}> Settings </div>
    </nav>
    );
};

