import React, { useState, useEffect, useRef } from 'react';
import { Modal } from "flowbite-react";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

import { Navbar } from './navbar';
import { db } from '../firebaseConfig.js';
import '../style/home.css';
import { fetchUserInfo, getUserPost } from "./userInfo.js";
import { handleImageUpload, getDate } from './helpers.js';

import { FaRegComment } from "react-icons/fa";
import { IoIosSend, IoIosAddCircleOutline } from "react-icons/io";
import { AiOutlineLike } from "react-icons/ai";

export const Home = () =>{
    const [userPost, setUserPost] = useState({
        "title": "My dumb owner didn't put a title",
        "desc": "My owner didn't have anything to say. I'm not surprised, they have a small brain.",
        "img": null,
        "pfp": null,
    })
    const [feedPost, setFeedPost] = useState([]); //feed post on the homepage
    const [postPopup, setPostPopup] = useState(false); //visbiilty of creating a new post popup
    const [userPopup, setUserPopup] = useState(false); //visbility of seeing a users profile popup
    const [commentPopup, setCommentPopup] = useState(false); //visbility of the comment popup
    const [userProfilePost, setUserProfilePost] = useState([]); //user post popup
    const [userComment, setUserComment] = useState(""); //comment that user submited
    const [comments, setComments] = useState([]); //comments on the post 
    const [currPostId, setCurrPostId] = useState(""); //stores the id of the post that the user is interacting with
    //setting values when you click on a username to see their profile
    const [userProfile, setUserProfile] = useState({ 
        name: "",
        desc: "",
        date: "",
        img: null,
    })
    
    const setNewPost = (postField, userInput) =>{
        setUserPost(prevDate => ({
            ...prevDate,
            [postField]: userInput
        }))
    }

    const toggleCommentPopup = (postId) => {
        // Open the clicked comment popup
        setCurrPostId(postId);
        loadComment(postId);
        setCommentPopup(!commentPopup);
    };

    //loads the current post on the homepage
    const isMounted = useRef(true);
    useEffect(() => {
        if (isMounted.current) {
            getFeed();
            // getPfp();
            isMounted.current = false;
        }
    }, [feedPost]);

    //creates new post 
    const handleSubmit = async (e) =>{
        e.preventDefault();
        // Check for undefined fields
        try{
            await addDoc(collection(db, "Homepage Feed"), {
                title: userPost.title,
                desc: userPost.desc,
                img: userPost.img,
                user: localStorage.getItem("userName"),
                date: getDate(),
                userPfp: localStorage.getItem("userPfp")
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
                date: getDate(),
                userPfp: localStorage.getItem("userPfp")
            })
            console.log("post added to user's firebase feed sucessfully");
        }catch(error){
            console.log("error ", error);
        }
    }

    const handleImageUploadCallback = (compressedDataUrl) => {
        setUserPost(prevState => ({
            ...prevState,
            img: compressedDataUrl // Update only the pic field
        }));
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
                pfp: doc.data().userPfp
            }))
            setFeedPost(postReceived);
        }catch(error){
            console.log("error ", error);
        }
    }

    const getProfile = async (userName) =>{
        const userInfo = await fetchUserInfo(userName);
        if(userInfo && userInfo.length > 0){
            setUserProfile(userInfo[0]);
            setUserProfilePost(await getUserPost(userInfo[0].id));
            setUserPopup(true);  
        }
    }

    //adds a comment to the post
    const addComment = async () =>{
        //add comment to the doc comment collection
        console.log(userComment);
        console.log(localStorage.getItem("userName"));
        if(userComment === ""){
            alert("comment cannot be empty");
            return;
        }
        await addDoc(collection(db, "Homepage Feed", currPostId, "comments"),{
            name: localStorage.getItem("userName"),
            comment: userComment,
            date: getDate()
        })
        loadComment(currPostId);
    }

    //loads all comments on the specific post
    const loadComment = async (postId) =>{
        const postDocs = await getDocs(collection(db, "Homepage Feed", postId, "comments"));
        const docComments = postDocs.docs.map(doc =>({
            userCommentName: doc.data().name,
            comment: doc.data().comment,
            date: doc.data().date
        }))
        setComments(docComments);
    }

    const sendFriendReq = async (userName) =>{
        try{
            const userInfo = await fetchUserInfo(userName);
            if(userInfo && userInfo.length > 0){
                var userEmail = userInfo[0].id;
            }

            const reqs = await getDocs(collection(db, "Users", userEmail, "friendRequest"))
            reqs.forEach((req) =>{
                if(req.data().requestedUser === localStorage.getItem("userName")){
                    console.log("you already sent a friend req");
                    return;
                }
            })
            await addDoc(collection(db, "Users", userEmail, "friendRequest"), {
                requestedUser: localStorage.getItem("userName"),
                reqUserPfp: localStorage.getItem("userPfp"),
                reqUserDate: getDate()
            })
        }catch(error){
            console.log("error ", error);
        }
    }

    return (
        <div className="homeContainer">
            {userPopup &&(
                <>
                    <div className="overlay" onClick={() => setUserPopup(false)}></div>
                    <Modal show={userPopup} onClose={() => setUserPopup(false)} className="userProfileModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                            <section className="profileContainer">
                                <img src={userProfile.img} alt="userPfp"/>
                                <div className="descContainerSide">
                                    <div className="profileDescContainer">
                                        <h1> {userProfile.name} </h1>
                                        <p id="userDesc"> {userProfile.desc} </p>
                                        <p id="userDate"> Member since: {userProfile.date} </p>
                                        <div className="userButtons">
                                        {/* makes sure that you cannot add yourself to the friend's list */}
                                        {userProfile.name !== localStorage.getItem("userName") && ( 
                                            <button className="addFriendBtn" onClick={() => sendFriendReq(userProfile.name)}>+ Add Friend</button>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="userProfilePostContainer">
                                {userProfilePost.map(post =>(
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
                                <input type="file" placeholder="show your cat" onChange={(e) => handleImageUpload(e, handleImageUploadCallback)} />
                                <button id="subBtn" type="submit">Post!</button>
                            </form>
                        </Modal.Body>
                    </div>  
                </Modal>
            </>
            )}
            {commentPopup && (
                <>
                    <div className="overlay" onClick={() => setCommentPopup(false)}></div>
                    {/* change className later */}
                    <Modal show={commentPopup} onClose={()=> setCommentPopup(false)} className="commentModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                            <Modal.Body>
                            <div className="bodyModalContainer">
                                <div className="currentPostContainer">
                                {feedPost.map((post) => {
                                    if (post.id === currPostId) {
                                        return (
                                            <div key={post.id}>
                                                <div className="postContainer">
                                                    <div className="userHeaderContainer">
                                                        <div className="imgContainer">
                                                            <img src={post.pfp} className="userPfp" alt="userpfp"/>
                                                        </div>
                                                        <div className="nameDateContainer">
                                                            <h2 className="userPostName" onClick={() => getProfile(post.user)}>{post.user}</h2>
                                                            <p className="postDate">{post.date}</p>
                                                        </div>     
                                                    </div>
                                                    {post.img && (
                                                        <img src={post.img} alt="user post" className="imgPost"/>
                                                    )}
                                                    <div className="captionContainer">
                                                        <h2>{post.title}</h2>
                                                        <p className="postDesc">{post.desc}</p>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        );
                                    }
                                    // If no matching post is found, return null
                                    return null;
                                })}
                                </div>
                                <div className="commentContainer">
                                    <h1> Comments </h1>
                                    <p className="comments">
                                        {comments.map(comment =>(
                                            <div key={comment.id}>
                                                <h2> {comment.userCommentName} </h2>
                                                <div className="commentDateContainer">
                                                    <p> {comment.comment} </p>
                                                    <p className="commentDate"> {comment.date} </p>
                                                </div>
                                            </div> 
                                        ))}
                                    </p>
                                    <div className="inputContainer">
                                        <input type="text" placeholder="Comment" value={userComment} onChange={(text)=> setUserComment(text.target.value)}></input>
                                        <IoIosSend className="icon" onClick={() => {
                                            addComment();
                                            setUserComment("");
                                            }}/> 
                                    </div>
                                </div> 
                            </div> 
                        </Modal.Body>
                    </Modal>
                </>
            )}
            <div className="tempBtnContainer"  onClick={() => setPostPopup(true)}>
                <IoIosAddCircleOutline className="postIcon"/>
                <p>New post</p>
            </div>
            <div className="pageContainer">
                <Navbar />
                <section className="feedContainer">
                    {feedPost.map((post) => (
                        <div key={post.id} className="postContainer">
                            <div className="userHeaderContainer" onClick={() => getProfile(post.user)}>
                                <div className="imgContainer">
                                    <img src={post.pfp} className="userPfp" alt="userpfp"/>
                                </div>
                                <div className="nameDateContainer">
                                    <h1 className="userPostName">{post.user}</h1>
                                    <p className="postDate">{post.date}</p>
                                </div>     
                            </div>
                            <div className="postImgContainer">
                                {post.img && (
                                    <img src={post.img} alt="user post" className="imgPost"/>
                                )}
                            </div>
                            <div className="postBodyContainer">
                                <h2>{post.title}</h2>
                                <p className="postDesc">{post.desc}</p>
                                <div className="footerContainer">
                                    <AiOutlineLike className="icons"/>
                                    <FaRegComment className="icons" id="commentIcon" onClick={() => {
                                        toggleCommentPopup(post.id);
                                        }}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
                <section className="suggested">
                    <p> this is a suggested section </p>
                </section>
            </div>
        </div>
        );
        
}