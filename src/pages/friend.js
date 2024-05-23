import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { Modal } from "flowbite-react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

import '../style/friend.css';
import { Navbar } from './navbar';

export const Friend = () =>{
    const [addFriendPopup, setAddFriendPopup] = useState(false); //visbility for addfriend modal
    const [newFriendInput, setNewFriendInput] = useState("");

    const findUser = async () =>{

        console.log(newFriendInput);
        setNewFriendInput("");
    }

    return(
        <div className="friendPageContainer">
            {addFriendPopup && (
            <>
                <div className="overlay" onClick={() => setAddFriendPopup(false)}></div>
                <Modal show={addFriendPopup} onClose={() => setAddFriendPopup(false)} className="addFriendModal">
                    <Modal.Header className="modalHeader"></Modal.Header>
                    <div className="friendBodyContainer">
                        <div className="friendHeadContainer">
                            <h1> Add a new friend </h1>
                            <div className="searchContainer">
                                <input type="text" value = {newFriendInput} placeholder="Enter username" className="searchInput" onChange={(e) => {setNewFriendInput(e.target.value)}}></input>
                                <FaSearch onClick={findUser}/>
                            </div>
                            
                        </div>
                        <Modal.Body>
                            <p> list of names that somewhat match </p>
                        </Modal.Body>
                    </div>  
                </Modal>
            </>
            )}
            <div className="tempBtnContainer" onClick={() =>{setAddFriendPopup(!addFriendPopup)}}>
                <FiUserPlus className="postIcon"/>
                <p> Add Friend </p> 
            </div>
            <div className="tempBtnContainer2" >
                <IoMdNotificationsOutline  className="postIcon"/>
                <p> Request </p> 
            </div>
            <section className="pageContainer">
                <Navbar/>
                <section className="friendSection">
                    <h1> Friends </h1>
                    <div className="friendsList">
                        <img src={{}} alt="friend pfp"/>
                        <h1> Name of Friend </h1>
                        <p> Date you became friends </p>
                    </div>
                </section>
            </section>
        </div>
    )
}