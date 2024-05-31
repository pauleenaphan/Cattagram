import React from 'react';
import { Navbar } from './navbar';
import '../style/chat.css';

import { RiChatNewLine } from "react-icons/ri";

export const Chat = () =>{
    return(
        <div className="chatContainer">
            <div className="tempBtnContainer" >
                <RiChatNewLine className="postIcon"/>
                <p> New Chat </p>
            </div>
            <section className="loadChatContainer">
                <Navbar/>
                <section className="pageContainer">
                    <h1> Your Chats </h1>
                    <p> Load your chats </p>
                </section>
            </section>
        </div>
    )
}