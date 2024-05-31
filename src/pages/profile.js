import React, { useState, useRef, useEffect } from "react";
import { Modal } from "flowbite-react";
import { collection, getDocs, updateDoc } from "firebase/firestore"; 
import { LiaUserEditSolid } from "react-icons/lia";
import { handleImageUpload } from './helpers.js';
import { fetchUserInfo, getUserPost } from "./userInfo.js";

import { Navbar } from "./navbar";
import { db } from "../firebaseConfig";
import '../style/profile.css';


export const Profile = () =>{
    const [editPopup, setEditPopup] = useState(false);
    const [feedPost, setFeedPost] = useState([]);
    const [userProfile, setUserProfile] = useState({ 
        name: "",
        desc: "",
        date: "",
        img: null,
    })

    const setProfile = (field, value) =>{
        setUserProfile(prevDate =>({
            ...prevDate,
            [field]: value
        }))
    }

    const isMounted = useRef(true);
    useEffect(() => {
        if (isMounted.current) {
            getProfile();
            isMounted.current = false;
        }
    }, [userProfile]);

    const getProfile = async () =>{
        const userInfo = await fetchUserInfo(localStorage.getItem("userName"));
        if (userInfo && userInfo.length > 0) {
            setUserProfile(userInfo[0]);
            setFeedPost(await getUserPost(userInfo[0].id))
        }
    }

    const handleImageUploadCallback = (compressedDataUrl) => {
        setUserProfile(prevState => ({
            ...prevState,
            img: compressedDataUrl // Update only the pic field
        }));
    };
    
    //update values onto firebase 
    const updateFirebase = async (e) =>{
        e.preventDefault();
        try{
            const querySnapshot = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"));
            await updateDoc(querySnapshot.docs[0].ref, { 
                profileDesc: userProfile.desc,
                pic: userProfile.img
            });
            localStorage.setItem("userPfp", userProfile.img);
        }catch (error){
            console.log("error ", error);
        }
        setEditPopup(false);
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
                                    <input type="file" placeholder="Change profile picture" onChange={(e) => handleImageUpload(e, handleImageUploadCallback)}/>
                                    <input type="text" placeholder="Update profile description" value={userProfile.desc} onChange={(e) => setProfile("desc", e.target.value)}/>
                                    <button type="submit">Update!</button>
                                </form>
                            </Modal.Body>
                        </div>
                        
                    </Modal>
                </>
            )}
            <div className="tempBtnContainer" onClick={() => setEditPopup(true)}>
                <LiaUserEditSolid className="postIcon"/>
                <p> Edit Profile </p>
            </div>
            
            <div className="profilePageContainer">
                <Navbar/>
                <section className="userProfileContainer">
                    <section className="headerContainer">
                        <img src={userProfile.img} alt="userPfp"/>
                        <div className="descContainer">
                            <h1 id="userName"> {userProfile.name} </h1>
                            <p id="userDesc"> {userProfile.desc} </p>
                            <p id="userDate"> Member Since: {userProfile.date} </p>
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