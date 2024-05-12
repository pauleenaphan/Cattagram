import React, { useState, useRef, useEffect } from "react";
import { Modal } from "flowbite-react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"; 
import { GoPencil } from "react-icons/go";

import { Navbar } from "./navbar";
import { db } from "../firebaseConfig";
import '../style/profile.css';

export const Profile = () =>{
    const [editPopup, setEditPopup] = useState(false);
    const [feedPost, setFeedPost] = useState([]);
    const [userP, setUserP] = useState({
        "name": "",
        "desc": "",
        "dateJoined": "",
        "pic": null
    })

    const setProfile = (field, value) =>{
        setUserP(prevDate =>({
            ...prevDate,
            [field]: value
        }))
    }

    const isMounted = useRef(true);
    useEffect(() => {
        if (isMounted.current) {
            getUserProfile();
            getFeed();
            isMounted.current = false;
        }
    }, [userP]);

    //gets the doc in the userInfo collection
    const getUserProfile = async () => {
        try {
            const profile = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"));
            profile.forEach(doc => {
                const data = doc.data();
                if (data.name === localStorage.getItem("userName")) {
                    setUserP({
                        name: data.name,
                        desc: data.profileDesc,
                        dateJoined: data.datejoined,
                        pic: data.pic
                    });
                }
            });
        } catch (error) {
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
            const maxWidth = 500; // Max width for the compressed image
            const maxHeight = 500; // Max height for the compressed image
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
            setUserP(prevState => ({
                ...prevState,
                pic: compressedDataUrl // Update only the pic field
            }));
        };
    };
    
    //updaate values onto firebase 
    const updateFirebase = async (e) =>{
        e.preventDefault();
        try{
            const querySnapshot = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"));
            await updateDoc(querySnapshot.docs[0].ref, { 
                pic: userP.pic 
            });
        }catch (error){
            console.log("error ", error);
        }
        setEditPopup(false);
    }

    //gets the user post from firebase
    const getFeed = async () =>{
        try{
            const post = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "post"));
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
        <div className="profileContainer">
            <Navbar/>
            {editPopup && (
                <>
                    <div className="overlay" onClick={() => setEditPopup(false)}></div>
                    <Modal show={editPopup} onClose={() => setEditPopup(false)} className="editModal">
                        <Modal.Header className="modalHeader">Edit your profile to look meowtastic</Modal.Header>
                        <Modal.Body> 
                            <form className="profileForm" onSubmit={updateFirebase}>
                                <input type="file" placeholder="Change profile picture" onChange={handleImageUpload}/>
                                <input type="text" placeholder="Update profile description" value={userP.desc} onChange={(e) => setProfile("desc", e.target.value)}/>
                                <button type="submit">Update!</button>
                            </form>
                        </Modal.Body>
                    </Modal>
                </>
            )}
            <div className="tempBtnContainer">
                <GoPencil className="tempBtn" onClick={() => setEditPopup(true)}/>
                <p> Edit Profile </p>
            </div>
            
            <div className="profileContainer">
                <section className="headerContainer">
                    <img src={userP.pic} alt="userPfp" onClick={() =>{ console.log("hi")}}/>
                    <div className="descContainer">
                        <div className="captionContainer">
                            <h1 id="userName"> {userP.name} </h1>
                            <p id="userDesc"> {userP.desc} </p>
                        </div>
                            <p id="userDate"> {userP.dateJoined} </p>
                    </div>
                </section>

                <section className="feedContainer">
                    {feedPost.map(post => (
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
            </div>
            
        </div>
    )
}