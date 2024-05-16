import React from 'react';
import { Navbar } from './navbar';
import '../style/chat.css';

import { RiChatNewLine } from "react-icons/ri";

export const Chat = () =>{
    //creates new chat
    const addChat = async () =>{

    }

    return(
        <div className="chatContainer">
            <Navbar/>
            <div className="tempBtnContainer" >
                <RiChatNewLine className="postIcon"/>
                <p> New Chat </p>
            </div>
            <section className="loadChatContainer">
                <h1> Your Chats </h1>
                <p> Load your chats </p>
            </section>

        </div>
    )
}