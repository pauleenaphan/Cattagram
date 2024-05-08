import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

import '../style/loading.css';
import loadingGif from "../imgs/loading.gif"

export const Cover = ()=>{
    const navigate = useNavigate(); 

    //cover page will staay active for 5 seconds
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (localStorage.getItem("isLogged") === "true") {
                navigate("/homepage");
            } else {
                navigate("/createAcc");
            }
        }, 5000); 
    
        return () => clearTimeout(timeoutId);
    }, [navigate]);

    return(
        <div className="pageContainer">
            <img className="loadingGif" src={loadingGif} alt="cat loading screen"/>
        </div>
        
    )
}