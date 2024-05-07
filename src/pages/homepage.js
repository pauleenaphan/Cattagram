import React, { useState, useEffect, useRef } from 'react';
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
        "img": null
    })

    const [feedPost, setFeedPost] = useState([]);

    const setNewPost = (postField, userInput) =>{
        setUserPost(prevDate => ({
            ...prevDate,
            [postField]: userInput
        }))
    }
    
    // const isMounted = useRef(true);

    // useEffect(() => {
    //     if (isMounted.current) {
    //         getFeed();
    //         isMounted.current = false;
    //     }
    // }, [feedPost]);

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

            setUserPost({
                "title": "",
                "desc": "",
                "img": null
            });

            console.log("entry added successfully");
        }catch(error){
            console.log("error ", error);
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]; // Get the selected file

        // Read the selected file as a data URL
        const reader = new FileReader();
        reader.onload = () => {
            // Update the img state with the data URL
            setUserPost(prevData => ({
                ...prevData,
                img: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

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
                    <input type="file" placeholder="Image (optional)" onChange={handleImageUpload}></input>
                    <button type="submit"> Post! </button>
                </form>
            </Popup>
            {feedPost.map(post =>(
                <div key={post.id}>
                    <p> {post.user} </p>
                    <p> {post.title} </p>
                    <p> {post.img} </p>
                </div>
                
            ))}
        </div>
    )
}