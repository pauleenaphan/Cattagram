import React, { useState, useEffect, useRef } from 'react';
import { Modal } from "flowbite-react";

import { GoPersonAdd } from "react-icons/go";
import { PiMailbox } from "react-icons/pi";
import { FaSearch, FaRegComment } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { AiOutlineLike } from "react-icons/ai";

import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"; 
// import levenshtein from 'fast-levenshtein';

import '../style/friend.css';
import { db } from '../firebaseConfig.js';
import { Navbar } from './navbar';
import { getDate, setAlert } from './helpers.js';
import { fetchUserInfo, getUserPost, likePost, addComment, loadComment } from "./userHelper.js";
import loadingSpinner from "../imgs/loadingSpinner.gif";

export const Friend = () =>{
    const [isLoading, setIsLoading] = useState(true);
    const [addFriendPopup, setAddFriendPopup] = useState(false); //visbility for addfriend modal
    const [userPopup, setUserPopup] = useState(false);
    const [userProfile, setUserProfile] = useState({ 
        name: "",
        desc: "",
        date: "",
        img: null,
    })
    const [userProfilePost, setUserProfilePost] = useState([]); //user post popup
    const [newFriendInput, setNewFriendInput] = useState("");
    const [friendSearchResult, setFriendSearchResult] = useState([]);
    const [friendReqPopup, setFriendReqPopup] = useState(false);
    const [friendReq, setFriendReq] = useState([]);
    const [friendReqStatus, setFriendReqStatus] = useState("");
    const [friendListStatus, setFriendListStatus] = useState("");
    const [friendList, setFriendList] = useState([]);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [currRemove, setCurrRemove] = useState(""); //current user to be remove from friend list
    const [currRevDoc, setCurrRevDoc] = useState(""); //current doc to removevfrom other user in the friend list
    const {distance} = require('fastest-levenshtein');
    const [userFoundStatus, setUserFoundStatus] = useState("");
    const [alertPopup, setAlertPopup] = useState(false); //notification popups
    const [alertMsg, setAlertMsg] = useState(""); //msg for the notification popup

    const [feedPost, setFeedPost] = useState([]); //feed post on the homepage
    const [commentPopup, setCommentPopup] = useState(false); //visbility of the comment popup
    const [userComment, setUserComment] = useState(""); //comment that user submited
    const [comments, setComments] = useState([]); //comments on the post 
    const [currPostId, setCurrPostId] = useState(""); //stores the id of the post that the user is interacting with


    //creates a list of users that have the similar name
    //uses fast-levenshtein to find matching names
    const findUser = async () =>{
        const results = [];
        setFriendSearchResult([]); //clear field everytime we search
        setUserFoundStatus("");
        setIsLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, "Users"));
            //loops thru each of the docs to find a matching username 
            for (const userDoc of usersSnapshot.docs) {
                const userInfoSnapshot = await getDocs(collection(db, 'Users', userDoc.id, 'userInfo'));
                userInfoSnapshot.forEach((userInfoDoc) => {
                    //smaller value = closest string match
                    if (distance(userInfoDoc.data().name, newFriendInput) <= (newFriendInput.length/2)){
                        //prevents user from seeing their name in the search and current friends
                        console.log(userInfoDoc.data().name)
                        if(userInfoDoc.data().name !== localStorage.getItem("userName") && !friendList.some(friend => friend.friendName === userInfoDoc.data().name)){
                            results.push({
                                distance: distance(userInfoDoc.data().name, newFriendInput),
                                id: userInfoDoc.id,
                                email: userDoc.id, //user's email
                                name: userInfoDoc.data().name,
                                pfp: userInfoDoc.data().pic,
                                dateJoined: userInfoDoc.data().datejoined,
                            })
                        }                       
                    }else{
                        console.log('not a match')
                    }
                });
            }
        }catch(error) {
            console.error('Error finding users:', error);
        }
        if(results.length === 0){
            setUserFoundStatus("0 Users were found! Try again! 😿");
        }else{
            if(results.length === 1){
                setUserFoundStatus(results.length + " User was found! 🙀");
            }else{
                setUserFoundStatus(results.length + " Users were found! 🙀");
            }
        }
        //sorts by lowest distance to highest
        setFriendSearchResult(results.sort((a, b) => a.distance - b.distance)); 
        setNewFriendInput("");
        setIsLoading(false);
    }

    //load user's friend req
    const loadFriendReq = async () =>{
        const startTime = Date.now();
        const friendReqs = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "friendRequest"))
        const elapsedTime = Date.now() - startTime;

        //loading screen will start only if the user is wating 3 seconds or longer
        if (elapsedTime > 3000) {
            setIsLoading(true);
        }
        const friendReqDocs = friendReqs.docs.map(doc =>({
            id: doc.id,
            reqDate: doc.data().reqUserDate,
            reqPfp: doc.data().reqUserPfp,
            reqUser: doc.data().requestedUser
        }))
        setFriendReq(friendReqDocs);
        if(friendReqDocs.length === 0){
            setFriendReqStatus("You currently have 0 friend request! 😿");
        }else{
            setFriendReqStatus(`You have ${friendReqDocs.length} friend request! 😸`);
        }

        setIsLoading(false);
    }

    //send friend request to picked user
    const sendFriendReq = async (userEmail, userName) =>{
        setIsLoading(true);

        //var for when a user has sent a request already
        let sentAlready = false;
        try{
            //takes in userEmail that the request is being sent to
            const reqs = await getDocs(collection(db, "Users", userEmail, "friendRequest"))
            reqs.forEach((req) =>{
                if(req.data().requestedUser === localStorage.getItem("userName")){
                    sentAlready = true;
                }
            })
            if(!sentAlready){
                await addDoc(collection(db, "Users", userEmail, "friendRequest"), {
                    requestedUser: localStorage.getItem("userName"),
                    reqUserPfp: localStorage.getItem("userPfp"),
                    reqUserDate: getDate()
                })
            }
        }catch(error){
            console.log("error ", error);
        }

        setIsLoading(false);
        if(sentAlready){
            setAlert(`You have already sent ${userName} a friend request 🙀`, setAlertMsg, setAlertPopup);
        }else{
            setAlert(`You have sent ${userName} a friend request 😸`, setAlertMsg, setAlertPopup);
        }
    }

    //pick whether to accept or decline friend request
    const friendReqRespond = async (status, docId, reqUser, reqPfp, reqDate) =>{
        setIsLoading(true);

        //remove request from doc
        await deleteDoc(doc(db, "Users", localStorage.getItem("userEmail"), "friendRequest", docId));
        if(status === false){
            return;
        }else{
            //add friend to your friend list, and the requested user friend list
            try{
                //add friend to currrent user's doc
                await addDoc(collection(db, "Users", localStorage.getItem("userEmail"), "friendList"),{
                    name: reqUser,
                    pfp: reqPfp,
                    date: reqDate
                })
                //add friend to requested user's doc
                const userInfo = await fetchUserInfo(reqUser);
                if(userInfo && userInfo.length > 0){
                    await addDoc(collection(db, "Users", userInfo[0].id, "friendList"),{
                        name: localStorage.getItem("userName"),
                        pfp: localStorage.getItem("userPfp"),
                        date: reqDate
                    })
                }
            }catch(error){
                console.log("error ", error);
            }
        }
        setIsLoading(false);
        loadFriendReq();
        loadFriends();
        setFriendReqPopup(false);
        if(status === false){
            setAlert(`You have rejected ${reqUser} as a friend 😿`, setAlertMsg, setAlertPopup);
        }else{
            setAlert(`You and ${reqUser} are now friends! 😸`, setAlertMsg, setAlertPopup);
        }
    }

    //removes friend from list
    const removeFriend = async () => {
        setConfirmPopup(false);
        setIsLoading(true);
        try{
            //removes friend from the current user's doc
            await deleteDoc(doc(db, "Users", localStorage.getItem("userEmail"), "friendList", currRevDoc));

            //removes current user from the other user's friend list
            const userInfo = await fetchUserInfo(currRemove);
            if(userInfo && userInfo.length > 0){
                const querySnapshot = await getDocs(collection(db, "Users", userInfo[0].id, "friendList"));
                for (const val of querySnapshot.docs) {
                    if (val.data().name === localStorage.getItem("userName")) {
                        await deleteDoc(doc(db, "Users", userInfo[0].id, "friendList", val.id));
                    }
                }
            }
        }catch(error){
            console.log("error ", error);
        }
        loadFriends();
        setIsLoading(false);
        setAlert(`You and ${currRemove} are no longer friends 😿`, setAlertMsg, setAlertPopup);
    };
    
    //loads user's friend on their friend's list
    const loadFriends = async () =>{
        setIsLoading(true);

        try{
            const list = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "friendList"))
            const listRec = list.docs.map(doc =>({
                id: doc.id,
                friendName: doc.data().name,
                friendPfp: doc.data().pfp,
                friendDate: doc.data().date
            }))
            setFriendList(listRec);
            console.log("friendlist lenght", listRec.length)
            setFriendListStatus(`${listRec.length}  😸`);
        }catch(error){
            console.log("error ", error);
        }

        setIsLoading(false);
    }

    const getProfile = async (userName) =>{
        setIsLoading(true);

        const userInfo = await fetchUserInfo(userName);
        if(userInfo && userInfo.length > 0){
            setUserProfile(userInfo[0]);
            setUserProfilePost(await getUserPost(userInfo[0].id));
            setUserPopup(true);  
        }
        setIsLoading(false);
    }

    const likeUserPost = (postDoc, postUserName) =>{
        //ensures getFeed is called
        likePost(postDoc, postUserName).then(() =>{
            setUserPopup(false);
            getProfile(postUserName);
        })    
    }

    const getFeed = async () =>{
        setIsLoading(true);
        try{
            const post = await getDocs(collection(db, "Homepage Feed"));
            const postReceived = post.docs.map(doc =>({
                id: doc.id,
                title: doc.data().title,
                desc: doc.data().desc,
                img: doc.data().img,
                user: doc.data().user,
                date: doc.data().date,
                pfp: doc.data().userPfp,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount
            }))
            setFeedPost(postReceived);
        }catch(error){
            console.log("error ", error);
        }

        setIsLoading(false);
    }

    const toggleCommentPopup = async (postId) => {
        console.log(postId);
        // Open the clicked comment popup
        getFeed();
        setCurrPostId(postId);
        setComments(await loadComment(postId));
        setCommentPopup(!commentPopup);
    };

    const addUserComment = async (postUserName) =>{
        addComment(userComment, currPostId);
        setComments(await loadComment(currPostId));
        // getProfile(postUserName)
    }

    //loads the current post on the homepage
    const isMounted = useRef(true);
    useEffect(() => {
        if (isMounted.current) {
            loadFriends();
            isMounted.current = false;
        }
    }, );

    return(
        <div className="friendPageContainer">
            <button id="hiddenButton" style={{display:'none'}} onClick={() =>{console.log("btn being clicked")}}></button>
            {isLoading &&(
                <>
                    <div className="overlay" id="loadingOverlay"></div>
                    <Modal show={isLoading} className="loadingModal">
                        {/* <Modal.Header></Modal.Header> */}
                        <div className="modalBody">
                            <Modal.Body>
                                <img src={loadingSpinner} alt="loadingSpin"></img>
                            </Modal.Body> 
                        </div>
                    </Modal>
                </>
            )}
            {alertPopup && (
                <>
                    <Modal show={alertPopup} onClose={() => setAlertPopup(false)} className="alertModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                            <div className="alertModalContainer">
                            <Modal.Body className="modalBody">
                                <p> {alertMsg} </p>
                            </Modal.Body>
                        </div>
                        
                    </Modal>
                </>
            )}
            {addFriendPopup && (
                <>
                    <div className="overlay" onClick={() => setAddFriendPopup(false)}></div>
                    <Modal show={addFriendPopup} onClose={() => setAddFriendPopup(false)} className="addFriendModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="friendBodyContainer">
                            <div className="friendHeadContainer">
                                <h1> Find a cool cat </h1>
                                <div className="searchContainer">
                                    <input 
                                        type="text" 
                                        value = {newFriendInput} 
                                        placeholder="Enter username" 
                                        className="searchInput" 
                                        onChange={(e) => {setNewFriendInput(e.target.value)}}
                                        onKeyDown={(e) =>{if(e.key === "Enter"){findUser()}}} 
                                    ></input>
                                    <FaSearch class="icon" onClick={findUser}/>
                                </div>
                                <p id="userFoundStatus"> {userFoundStatus} </p>
                            </div>
                            <Modal.Body>
                                <div className="matchedUserOuterContainer">
                                    {friendSearchResult.map(user =>(
                                        <div key={user.id} className="matchUserContainer">
                                            <img src={user.pfp} onClick={() => {getProfile(user.name)}} alt="userpfp"/>
                                            <div className="userDescOuterContainer">
                                                <div className="userDescContainer">
                                                    <h1 onClick={() => {getProfile(user.name)}}> {user.name} </h1>
                                                    <p> Member Since: {user.dateJoined} </p> 
                                                </div>
                                                <button className="addFriendBtn" onClick={()=>{sendFriendReq(user.email, user.name)}}> + Add Friend </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Modal.Body>
                        </div>  
                    </Modal>
                </>
            )}
            {userPopup &&(
                <>
                    <div className="overlay" onClick={() => setUserPopup(false)}></div>
                    <Modal show={userPopup} onClose={() => setUserPopup(false)} className="userProfileModalInFriend">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                            <section className="profileContainer">
                                <img className="userPfp" src={userProfile.img} alt="userPfp"/>
                                    <div className="profileFriendDescContainer">
                                        <h1> {userProfile.name} </h1>
                                        <p id="userDesc"> {userProfile.desc} </p>
                                        <p id="userDate"> Member Since: {userProfile.date} </p>
                                    </div>
                            </section>
                            <section className="userProfilePostContainer">
                                {userProfilePost.map(post => (
                                    <div key={post.id} className="userPostContainer">
                                        <div className="nameDateContainer">
                                            <h1 className="userPostName">{post.user}</h1>
                                            <p className="postDate">{post.date}</p>
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
                                                <div className="likeComContainer" onClick={() =>{likeUserPost(post.id, post.user)}}>
                                                    <AiOutlineLike className="icons"/>
                                                    <p>{post.likeCount}</p>
                                                </div>
                                                <div className="likeComContainer" onClick={() => {toggleCommentPopup(post.id)}}>
                                                    <FaRegComment className="icons" id="commentIcon"/>
                                                    <p> {post.commentCount} </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                ))}
                            </section>
                            </Modal.Body>
                        </div>
                    </Modal>
                </>
            )}
            {friendReqPopup &&(
                <>
                    <div className="overlay" onClick={() => setFriendReqPopup(false)}></div>
                    <Modal show={friendReqPopup} onClose={() => setFriendReqPopup(false)} className="friendReqModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                                <h1> Friend Request </h1>
                                <h2> {friendReqStatus} </h2>
                                <div className="matchedUserOuterContainer">
                                    {friendReq.map(req =>(
                                        <div key={req.id} className="matchUserContainer">
                                        <img src={req.reqPfp} onClick={() => {getProfile(req.reqUser)}} alt="userpfp"/>
                                            <div className="userDescOuterContainer">
                                                <div className="userDescContainer">
                                                    <h3 onClick={() => {getProfile(req.reqUser)}}> {req.reqUser} </h3>
                                                    <p> {req.reqDate} </p> 
                                                </div>
                                                <div className="accDelBtns">
                                                    <button id="accFriBtn" onClick={() =>{friendReqRespond(true, req.id, req.reqUser, req.reqPfp, req.reqDate)}}> Accept </button>
                                                    <button id="decFriBtn" onClick={() =>{friendReqRespond(false, req.id, req.reqUser, req.reqPfp, req.reqDate)}}> Decline </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Modal.Body>
                        </div>
                    </Modal>
                </>
            )}
            {confirmPopup &&(
                <>
                    <div className="overlay" onClick={() => setConfirmPopup(false)}></div>
                    <Modal show={confirmPopup} onClose={() => setConfirmPopup(false)} className="confirmRemoveModal">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                                <div className="modalBodyContainer">
                                    <h1> Are you sure you want to remove {currRemove} as a friend? 😿</h1> 
                                    <div className="userBtns">
                                        <button id="removeBtn" onClick={() => {removeFriend()}}> Confirm </button>
                                        <button id="nvmBtn" onClick={() =>{setConfirmPopup(false)}}> Nevermind! </button>
                                    </div>
                                </div> 
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
                                                            <img src={post.pfp} className="userPfp" onClick={() => getProfile(post.user)} alt="userpfp"/>
                                                        </div>
                                                        <div className="nameDateContainer">
                                                            <h2 className="userPostName" onClick={() => getProfile(post.user)}>{post.user}</h2>
                                                            <p className="postDate">{post.date}</p>
                                                        </div>     
                                                    </div>
                                                    <div className="imgContainer2">
                                                        {post.img && (
                                                            <img src={post.img} alt="user post" className="imgPost"/>
                                                        )}
                                                    </div>
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
                                    <div className="commentHeaderContainer">
                                        <h1> Comments </h1>
                                        <p className="comments">
                                            {comments.map(comment =>(
                                                <div key={comment.id}>
                                                    <div className="pfpNameContainer">
                                                        <img src={comment.pfp} alt="userPfp" onClick={() =>{getProfile(comment.userCommentName)}}/>
                                                        <h2 onClick={() =>{getProfile(comment.userCommentName)}}> {comment.userCommentName} </h2>
                                                    </div>
                                                    <div className="commentDateContainer">
                                                        <p> {comment.comment} </p>
                                                        <p className="commentDate"> {comment.date} </p>
                                                    </div>
                                                </div> 
                                            ))}
                                        </p>
                                    </div>
                                    <div className="inputContainer">
                                        <input 
                                            type="text" 
                                            placeholder="Comment" 
                                            value={userComment} 
                                            onChange={(text)=> setUserComment(text.target.value)}
                                            onKeyDown={(e) =>{if(e.key === "Enter"){
                                                addUserComment();
                                                setUserComment("");}}}
                                            ></input>
                                        <IoIosSend className="icon" onClick={() => {
                                            addUserComment();
                                            setUserComment("");
                                            }}/> 
                                    </div>
                                </div> 
                            </div> 
                        </Modal.Body>
                    </Modal>
                </>
            )}
            <div className="tempBtnContainer" onClick={() =>{setAddFriendPopup(!addFriendPopup)}}>
                <GoPersonAdd className="postIcon"/>
                <p> Add Friend </p> 
            </div>
            <div className="tempBtnContainer2" onClick={() =>{
                setFriendReqPopup(!friendReqPopup);
                loadFriendReq();
            }}>
                <PiMailbox className="postIcon"/>
                <p> Request </p> 
            </div>
            <section className="pageContainer">
                <Navbar/>
                <section className="friendSection">
                    <div className="pageHeader">
                        <h1> Your Pawtastic Friends! </h1>
                        <p id="friendListStatus"> {friendListStatus} </p>
                    </div>
                    <div className="friendsList">
                        {friendList.map(friend =>(
                            <div key={friend.id} className="friendListContainer">
                                <img id="friendPfp" src={friend.friendPfp} onClick={() => {getProfile(friend.friendName)}} alt="userpfp"/>
                                <div className="userDescOuterContainer">
                                    <div className="userDescContainer">
                                        <h2 onClick={() => {getProfile(friend.friendName)}}> {friend.friendName} </h2>
                                        <p> Added on: {friend.friendDate} </p> 
                                    </div>
                                    <div className="userBtns">
                                        <button id="removeFriBtn" onClick={() =>{
                                            setCurrRemove(friend.friendName);
                                            setCurrRevDoc(friend.id);
                                            console.log(friend.id);
                                            setConfirmPopup(!confirmPopup);
                                        }}> Remove friend </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        </div>
    )
}