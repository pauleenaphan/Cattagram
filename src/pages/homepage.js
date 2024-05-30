import React, { useState, useEffect, useRef } from 'react';
import { Modal } from "flowbite-react";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

import { Navbar } from './navbar';
import { db } from '../firebaseConfig.js';
import '../style/home.css';
import { fetchUserInfo, getUserPost} from "./userInfo.js";
import { handleImageUpload, getDate } from './helpers.js';

import { FaRegComment, FaRegPlusSquare } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
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
    // const {userData, updateUserData} = useContext(UserContext); 
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

    // const getPfp = async () =>{
    //     try {
    //         const profile = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "userInfo"));
    //         profile.forEach(doc => {
    //             const data = doc.data();
    //             if (data.name === localStorage.getItem("userName")) {
    //                 setUserPost("pfp", data.pic);
    //                 localStorage.setItem("userPfp", data.pic);
    //             }
    //         });
    //     } catch (error) {
    //         console.log("error ", error);
    //     }
    // }

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

    const addFriend = async (userName) =>{
        console.log(userName);
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
                                        <p> {userProfile.desc} </p>
                                        <p> {userProfile.date} </p>
                                    </div>
                                    <div className="userButtons">
                                        <button className="addFriendBtn" onClick={() =>{ addFriend(userProfile.name)}}> + Add Friend </button>
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
                                <button type="submit">Post!</button>
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
                                                    <h2>{post.title}</h2>
                                                    <p className="postDesc">{post.desc}</p>
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
                <FaRegPlusSquare className="postIcon"/>
                <p>New post</p>
            </div>
            <div className="pageContainer">
                <Navbar />
                <section className="feedContainer">
                    {feedPost.map((post) => (
                        <div key={post.id} className="postContainer">
                            <div className="postContainer2">
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