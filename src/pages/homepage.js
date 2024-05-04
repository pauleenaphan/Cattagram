import React from 'react';
import Popup from 'reactjs-popup';

import { Navbar } from './navbar';

export const Home = () =>{

    const handleSubmit = (e) =>{
        e.preventDefault();
    }

    return(
        <div>
            <Navbar/>
            <h1> WE IN HOME PAGE </h1>
            <Popup trigger={<button> New Post </button>} position="right center" closeOnDocumentClick={false}>
                <form className="newPost" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title"></input>
                    <input type="text" placeholder="Description"></input>
                    <input type="text" placeholder="Image (optional)"></input>
                    <button type="submit"> Post! </button>
                </form>
            </Popup>
        </div>
    )
}