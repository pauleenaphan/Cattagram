import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import { collection, addDoc, getDocs } from "firebase/firestore"; 

import { Navbar } from './navbar';
import { db } from '../firebaseConfig.js';

//returns date in month/day/year format
const getDate = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; 
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
};

export const Home = () =>{
    const [userPost, setUserPost] = useState({
        "title": "",
        "desc": "",
        "img": ""
    })

    const [feedPost, setFeedPost] = useState([]);

    const setNewPost = (postField, userInput) =>{
        setUserPost(prevDate => ({
            ...prevDate,
            [postField]: userInput
        }))
    }
    
    useEffect(() => {
        getFeed();
    }, [feedPost]);

    //creates new post 
    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            await addDoc(collection(db, "Homepage Feed"), {
                title: userPost.title,
                desc: userPost.desc,
                img: userPost.img,
                user: localStorage.getItem("userName"),
                date: getDate()
            }); 
            console.log("entry added successfully");
        }catch(error){
            console.log("error ", error);
        }
    }

    const getFeed = async () =>{
        try{
            const post = await getDocs(collection(db, "Homepage Feed"));
            const postReceived = post.docs.map(doc =>({
                id: doc.id,
                title: doc.data().title,
                desc: doc.data().desc,
                img: doc.data().img,
                user: doc.data().user,
                date: doc.data().date,
            }))
            setFeedPost(postReceived);
        }catch(error){
            console.log("error ", error);
        }
    }

    return(
        <div>
            <Navbar/>
            <h1> WE IN HOME PAGE </h1>
            <Popup trigger={<button> New Post </button>} position="right center" closeOnDocumentClick={false}>
                <form className="newPost" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title" onChange={(e) => setNewPost("title", e.target.value)}></input>
                    <input type="text" placeholder="Description" onChange={(e) => setNewPost("desc", e.target.value)}></input>
                    <input type="text" placeholder="Image (optional)" onChange={(e) => setNewPost("img", e.target.value)}></input>
                    <button type="submit"> Post! </button>
                </form>
            </Popup>
            {feedPost.map(post =>(
                <p key={post.id}> {post.title} </p>
            ))}
        </div>
    )
}