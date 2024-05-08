import React, { useState, useEffect, useRef } from 'react';
import { Modal } from "flowbite-react";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

import { Navbar } from './navbar';
import { db } from '../firebaseConfig.js';
import '../style/home.css';

import { FaRegPlusSquare} from "react-icons/fa";


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
    const [postPopup, setPostPopup] = useState(false);
    

    const setNewPost = (postField, userInput) =>{
        setUserPost(prevDate => ({
            ...prevDate,
            [postField]: userInput
        }))
    }
    
    const isMounted = useRef(true);

    useEffect(() => {
        if (isMounted.current) {
            getFeed();
            isMounted.current = false;
        }
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
            getFeed();
            setPostPopup(false);
            console.log("entry added successfully");
        }catch(error){
            console.log("error ", error);
        }
        
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]; // Get the selected file

        // Create a new FileReader instance
        const reader = new FileReader();

        // Set up FileReader onload callback function
        reader.onload = (event) => {
            // Compress the image before uploading
            compressImage(event.target.result);
        };

        // Read the selected file as a data URL
        reader.readAsDataURL(file);
    };

    const compressImage = (dataUrl) => {
        const imageElement = new Image();
        imageElement.src = dataUrl;

        // Set up image onload callback function
        imageElement.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 800; // Max width for the compressed image
            const maxHeight = 600; // Max height for the compressed image
            let width = imageElement.width;
            let height = imageElement.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageElement, 0, 0, width, height);

            // Convert canvas to data URL with JPEG format and quality 0.7
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 1);

            // Set the compressed image as the new image state
            setUserPost(prevData => ({
                ...prevData,
                img: compressedDataUrl
            }));
        };
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
        <div className="homeContainer">
            <Navbar/>
            {/* <button onClick={() => {setPostPopup(true)}}> New Post </button> */}
            <div className="headerContainer">
                <h1> New post </h1>
                <FaRegPlusSquare className="postIcon" onClick={() => {setPostPopup(true)}}/>
            </div>
            
            <Modal show={postPopup} onClose={() =>{setPostPopup(false)}} className="newPostModal">
                <Modal.Header className="modalHeader"> Create a meowtastic post! </Modal.Header>
                <Modal.Body>
                    <form className="newPost" onSubmit={handleSubmit}>
                        <input type="text" placeholder="Title" onChange={(e) => setNewPost("title", e.target.value)} />
                        <textarea placeholder="Description" style={{width: '70%', height: "200px"}} onChange={(e) => setNewPost("desc", e.target.value)} />
                        <input type="file" placeholder="show your cat" onChange={handleImageUpload} />
                        <button type="submit"> Post! </button>
                    </form> 
                </Modal.Body>
            </Modal>
            
            <section className="feedContainer">
                {feedPost.map(post =>(
                    <div key={post.id} className="postContainer">
                        <h1 className="userPostName"> {post.user} </h1>
                        {post.img &&( //checks whether or not img is null or undefined
                            <img style={{width: '80%'}} src={post.img} alt="user post"/>
                        )}
                        <div className="postHeader">
                            <h2> {post.title} </h2>
                            <p className="postDate"> {post.date} </p>
                        </div>
                        <p className="postDesc"> {post.desc} </p>
                    </div>
                ))}
            </section>
        </div>
    )
}