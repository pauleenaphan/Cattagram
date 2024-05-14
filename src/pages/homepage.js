import React, { useState, useEffect, useRef } from 'react';
import { Modal } from "flowbite-react";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

import { Navbar } from './navbar';
import { db } from '../firebaseConfig.js';
import '../style/home.css';

import { FaRegPlusSquare } from "react-icons/fa";


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
        "title": "My dumb owner didn't put a title",
        "desc": "My owner didn't have anything to say. I'm not surprised, they have a small brain.",
        "img": null
    })

    const [feedPost, setFeedPost] = useState([]);
    const [postPopup, setPostPopup] = useState(false);
    const [userPopup, setUserPopup] = useState(false);

    const [userProfile, setUserProfile] = useState({
        name: "",
        desc: "",
        date: "",
        img: null,
    })
    const [userProfilePost, setUserProfilePost] = useState([]);

    // //used to set userpopup profile
    // const setProfile = (postField, userInfo) =>{
    //     setUserProfile(prevData => ({
    //         ...prevData,
    //         [postField]: userInfo
    //     }))
    // }
    

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
            console.log("post added to feed sucessfully");
        }catch(error){
            console.log("error ", error);
        }

        try{
            await addDoc(collection(db, "Users", localStorage.getItem("userEmail"), "post"), {
                title: userPost.title,
                desc: userPost.desc,
                img: userPost.img,
                user: localStorage.getItem("userName"),
                date: getDate()
            })
            console.log("post added to user's firebase feed sucessfully");
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

    //gets the post from firebase
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

    //gets info of the user when pressed on and set its values
    const fetchUserInfo = async (userName) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "Users"));
            
            if(usersSnapshot.empty){
                console.log("empty")
            }else{
                console.log("not empty")
            }
            //loops thru each of the docs to find a matching username 
            for (const userDoc of usersSnapshot.docs) {
                const userInfoSnapshot = await getDocs(collection(db, 'Users', userDoc.id, 'userInfo'));
                userInfoSnapshot.forEach((userInfoDoc) => {
                    const userInfoData = userInfoDoc.data();
                    console.log("userDoc", userDoc.id);
                    if (userInfoData.name === userName) {
                        setUserProfile({
                            name: userInfoData.name,
                            desc: userInfoData.profileDesc,
                            date: userInfoData.datejoined,
                            img: userInfoData.pic,
                        })
                        //set profile post BEFORE we call the popup to open 
                        //also need to pass in the userDoc id rather than setting it to a prop so it updates in time
                        getUserProfilePost(userDoc.id);
                        setUserPopup(true);    
                    }
                });
            }
        }catch(error) {
            console.error('Error fetching user info:', error);
        }
    };

    //gets all the post that the user has posted
    const getUserProfilePost = async (userEmail) =>{
        const post = await getDocs(collection(db, "Users", userEmail, "post"));
            const postReceived = post.docs.map(doc =>({
                id: doc.id,
                title: doc.data().title,
                desc: doc.data().desc,
                img: doc.data().img,
                user: doc.data().user,
                date: doc.data().date,
            }))
            setUserProfilePost(postReceived);
    }

    return (
        <div className="homeContainer">
            <Navbar />
            {userPopup &&(
                <>
                    <div className="overlay" onClick={() => setUserPopup(false)}></div>
                    <Modal show={userPopup} onClose={() => setUserPopup(false)} className="userProfileModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                            <section className="profileContainer">
                                <img src={userProfile.img} alt="userPfp"/>
                                <div className="profileDescContainer">
                                    <h1> {userProfile.name} </h1>
                                    <p> {userProfile.desc} </p>
                                    <p> {userProfile.date} </p>
                                </div>
                                
                            </section>
                            <section className="userProfilePostContainer">
                                {userProfilePost.map(post =>(
                                    <div key={post.id} className="userPostContainer">
                                        <h1 className="userPostName">{post.user}</h1>
                                        {post.img && (
                                        <img src={post.img} alt="user post" />
                                        )}
                                        <div className="postHeader">
                                        <h2>{post.title}</h2>
                                        <p className="postDate">{post.date}</p>
                                        </div>
                                        <p className="postDesc">{post.desc}</p>
                                    </div>
                                ))}
                            </section>
                            </Modal.Body>
                        </div>
                    </Modal>
                </>
            )}
            {postPopup && (
            <>
                <div className="overlay" onClick={() => setPostPopup(false)}></div>
                <Modal show={postPopup} onClose={() => setPostPopup(false)} className="newPostModal">
                    <Modal.Header className="modalHeader"></Modal.Header>
                    <div className="bodyModalContainer">
                        <h1> Create a meowtastic post! </h1>
                        <Modal.Body>
                            <form className="newPost" onSubmit={handleSubmit}>
                                <input type="text" placeholder="Title" onChange={(e) => setNewPost("title", e.target.value)} />
                                <textarea placeholder="Description" style={{ width: '80%', height: "200px" }} onChange={(e) => setNewPost("desc", e.target.value)} />
                                <input type="file" placeholder="show your cat" onChange={ handleImageUpload } />
                                <button type="submit">Post!</button>
                            </form>
                        </Modal.Body>
                    </div>  
                </Modal>
            </>
            )}
            <div className="tempBtnContainer"  onClick={() => setPostPopup(true)}>
                <FaRegPlusSquare className="postIcon"/>
                <p>New post</p>
            </div>
        
            <section className="feedContainer">
            {feedPost.map(post => (
                <div key={post.id} className="postContainer">
                <h1 className="userPostName" onClick={() => fetchUserInfo(post.user)}>{post.user}</h1>
                {post.img && (
                    <img src={post.img} alt="user post" />
                )}
                <div className="postHeader">
                    <h2>{post.title}</h2>
                    <p className="postDate">{post.date}</p>
                </div>
                <p className="postDesc">{post.desc}</p>
                </div>
            ))}
            </section>
        </div>
        );
        
}