import React, { useState, useEffect, useRef } from 'react';
import { FiUserPlus } from "react-icons/fi";
import { Modal } from "flowbite-react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"; 
import levenshtein from 'fast-levenshtein';

import { getDate } from './helpers.js';
import '../style/friend.css';
import { db } from '../firebaseConfig.js';
import { Navbar } from './navbar';
import { fetchUserInfo, getUserPost } from "./userInfo.js";

export const Friend = () =>{
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
    const [friendList, setFriendList] = useState([]);
    const {distance} = require('fastest-levenshtein');
    const [userFoundStatus, setUserFoundStatus] = useState("");

    //loads the current post on the homepage
    const isMounted = useRef(true);
    useEffect(() => {
        if (isMounted.current) {
            loadFriends();
            // getPfp();
            isMounted.current = false;
        }
    }, []);

    //creates a list of users that have the similar name
    //uses fast-levenshtein to find matching names
    const findUser = async () =>{
        const results = [];
        setFriendSearchResult([]); //clear field everytime we search
        setUserFoundStatus("");
        try {
            const usersSnapshot = await getDocs(collection(db, "Users"));
            //loops thru each of the docs to find a matching username 
            for (const userDoc of usersSnapshot.docs) {
                const userInfoSnapshot = await getDocs(collection(db, 'Users', userDoc.id, 'userInfo'));
                userInfoSnapshot.forEach((userInfoDoc) => {
                    //smaller value = closest string match
                    if (distance(userInfoDoc.data().name, newFriendInput) <= (newFriendInput.length/2)){
                        //prevents user from seeing their name in the search
                        if(userInfoDoc.data().name !== localStorage.getItem("userName")){
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
            setUserFoundStatus("0 Users were found! Try again :(");
            return
        }else{
            if(results.length === 1){
                setUserFoundStatus(results.length + " User was found!");
            }else{
                setUserFoundStatus(results.length + " Users were found!");
            }
            
        }
        //sorts by lowest distance to highest
        setFriendSearchResult(results.sort((a, b) => a.distance - b.distance)); 
        setNewFriendInput("");
    }

    //load user's friend req
    const loadFriendReq = async () =>{
        const friendReqs = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "friendRequest"))
        const friendReqDocs = friendReqs.docs.map(doc =>({
            id: doc.id,
            reqDate: doc.data().reqUserDate,
            reqPfp: doc.data().reqUserPfp,
            reqUser: doc.data().requestedUser
        }))
        setFriendReq(friendReqDocs);
        if(friendReqDocs.length === 0){
            setFriendReqStatus("You have 0 friend request! :(");
        }else{
            setFriendReqStatus(`You have ${friendReqDocs.length} friend request!`);
        }
    }

    //send friend request to picked user
    const sendFriendReq = async (userEmail) =>{
        try{
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

    //pick whether to accept or decline friend request
    const friendReqRespond = async (status, docId, reqUser, reqPfp, reqDate) =>{
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
        loadFriendReq();
        loadFriends();
    }

    const loadFriends = async () =>{
        try{
            const list = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "friendList"))
            const listRec = list.docs.map(doc =>({
                id: doc.id,
                friendName: doc.data().name,
                friendPfp: doc.data().pfp,
                friendDate: doc.data().date
            }))
            setFriendList(listRec);
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

    return(
        <div className="friendPageContainer">
            {addFriendPopup && (
            <>
                <div className="overlay" onClick={() => setAddFriendPopup(false)}></div>
                <Modal show={addFriendPopup} onClose={() => setAddFriendPopup(false)} className="addFriendModal">
                    <Modal.Header className="modalHeader"></Modal.Header>
                    <div className="friendBodyContainer">
                        <div className="friendHeadContainer">
                            <h1> Find a cool cat </h1>
                            <div className="searchContainer">
                                <input type="text" value = {newFriendInput} placeholder="Enter username" className="searchInput" onChange={(e) => {setNewFriendInput(e.target.value)}}></input>
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
                                            <h1 onClick={() => {getProfile(user.name)}}> {user.name} </h1>
                                            <div className="userDescContainer">
                                                <p> {user.dateJoined} </p> 
                                                <button className="addFriendBtn" onClick={()=>{sendFriendReq(user.email)}}> + Add Friend </button>
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
            {userPopup &&(
                <>
                    <div className="overlay" onClick={() => setUserPopup(false)}></div>
                    <Modal show={userPopup} onClose={() => setUserPopup(false)} className="userProfileModalInFriend">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                            <section className="profileContainer">
                                <img src={userProfile.img} alt="userPfp"/>
                                    <div className="profileFriendDescContainer">
                                        <h1> {userProfile.name} </h1>
                                        <p> {userProfile.desc} </p>
                                        <p> {userProfile.date} </p>
                                    </div>
                            </section>
                            <section className="userProfilePostContainer">
                                {userProfilePost.map(post => (
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
            {friendReqPopup &&(
                <>
                    <div className="overlay" onClick={() => setFriendReqPopup(false)}></div>
                    <Modal show={friendReqPopup} onClose={() => setFriendReqPopup(false)} className="userProfileModalInFriend">
                        <Modal.Header className="modalHeader"></Modal.Header>
                        <div className="userBodyModalContainer">
                            <Modal.Body>
                                <p> {friendReqStatus} </p>
                                <div className="matchedUserOuterContainer">
                                    {friendReq.map(req =>(
                                        <div key={req.id} className="matchUserContainer">
                                        <img src={req.reqPfp} onClick={() => {getProfile(req.reqUser)}} alt="userpfp"/>
                                            <div className="userDescOuterContainer">
                                                <h1 onClick={() => {getProfile(req.reqUser)}}> {req.reqUser} </h1>
                                                <div className="userDescContainer">
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

            <div className="tempBtnContainer" onClick={() =>{setAddFriendPopup(!addFriendPopup)}}>
                <FiUserPlus className="postIcon"/>
                <p> Add Friend </p> 
            </div>
            <div className="tempBtnContainer2" onClick={() =>{
                setFriendReqPopup(!friendReqPopup);
                loadFriendReq();
            }}>
                <IoMdNotificationsOutline  className="postIcon"/>
                <p> Request </p> 
            </div>
            <section className="pageContainer">
                <Navbar/>
                <section className="friendSection">
                    <h1> Your Pawtastic Friends! </h1>
                    <div className="friendsList">
                        {friendList.map(friend =>(
                            <div key={friend.id} className="friendListContainer">
                                <img id="friendPfp" src={friend.friendPfp} onClick={() => {getProfile(friend.friendName)}} alt="userpfp"/>
                                <div className="userDescOuterContainer">
                                    <h2 onClick={() => {getProfile(friend.friendName)}}> {friend.friendName} </h2>
                                    <div className="userDescContainer">
                                        <p> Added on: {friend.friendDate} </p> 
                                    </div>
                                    <div className="userBtns">
                                        <button id="removeFriBtn"> Remove friend </button>
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