import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

export const Cover = ()=>{
    const navigate = useNavigate(); 

    useEffect(() => {
        //delay navigation by 3 seconds
        const timeoutId = setTimeout(() => {
            if (localStorage.getItem("isLogged") === "true") {
                navigate("/homepage");
            } else {
                navigate("/createAcc");
            }
        }, 3000); 
    
        return () => clearTimeout(timeoutId);
    }, [navigate]);

    return(
        <p> Cattagram is loading! </p>
    )
}