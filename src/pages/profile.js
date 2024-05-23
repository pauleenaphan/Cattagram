import React, { useState, useRef, useEffect } from "react";
import { Modal } from "flowbite-react";
import { collection, getDocs, updateDoc } from "firebase/firestore"; 
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
            const size = 500; // Target size for both width and height
    
            // Set canvas dimensions
            canvas.width = size;
            canvas.height = size;
    
            // Calculate cropping dimensions
            let cropX = 0;
            let cropY = 0;
            let width = imageElement.width;
            let height = imageElement.height;
    
            // Calculate dimensions for square cropping
            if (width > height) {
                // Landscape orientation
                cropX = (width - height) / 2;
                width = height;
            } else if (height > width) {
                // Portrait orientation
                cropY = (height - width) / 2;
                height = width;
            }
    
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageElement, cropX, cropY, width, height, 0, 0, size, size);
    
            // Convert canvas to data URL with JPEG format and quality 1
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
                profileDesc: userP.desc,
                pic: userP.pic 
            });
            localStorage.setItem("userPfp", userP.pic);
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
            {editPopup && (
                <>
                    <div className="overlay" onClick={() => setEditPopup(false)}></div>
                    <Modal show={editPopup} onClose={() => setEditPopup(false)} className="editModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="bodyModalContainer">
                            <h1> Edit your profile to look meowtastic! </h1>
                            <Modal.Body> 
                                <form className="profileForm" onSubmit={updateFirebase}>
                                    <input type="file" placeholder="Change profile picture" onChange={handleImageUpload}/>
                                    <input type="text" placeholder="Update profile description" value={userP.desc} onChange={(e) => setProfile("desc", e.target.value)}/>
                                    <button type="submit">Update!</button>
                                </form>
                            </Modal.Body>
                        </div>
                        
                    </Modal>
                </>
            )}
            <div className="tempBtnContainer" onClick={() => setEditPopup(true)}>
                <GoPencil className="postIcon"/>
                <p> Edit Profile </p>
            </div>
            
            <div className="profilePageContainer">
                <Navbar/>
                <section className="userProfileContainer">
                    <section className="headerContainer">
                        <img src={userP.pic} alt="userPfp" onClick={() =>{ console.log("hi")}}/>
                        <div className="descContainer">
                            <h1 id="userName"> {userP.name} </h1>
                            <p id="userDesc"> {userP.desc} </p>
                            <p id="userDate"> {userP.dateJoined} </p>
                        </div>
                    </section>
                    <section className="userFeedContainer">
                        {feedPost.map(post => (
                            <div key={post.id} className="userPostContainer">
                                <div className="nameDateContainer">
                                    <h1 className="userPostName">{post.user}</h1>
                                    <p className="postDate">{post.date}</p>
                                </div>
                                {post.img && (
                                <img src={post.img} alt="user post" />
                                )}
                                <div className="postBodyContainer">
                                    <h2>{post.title}</h2>
                                    <p className="postDesc">{post.desc}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                </section>
            </div>
        </div>
    )
}