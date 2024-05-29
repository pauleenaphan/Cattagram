import React, { useState } from 'react';
import { FiUserPlus } from "react-icons/fi";
import { Modal } from "flowbite-react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { collection, getDocs, addDoc } from "firebase/firestore"; 
// import levenshtein from 'fast-levenshtein';

import '../style/friend.css';
import { db } from '../firebaseConfig.js';
import { Navbar } from './navbar';

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
    // const {distance} = require('fastest-levenshtein');
    const [userFoundStatus, setUserFoundStatus] = useState("");

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
                    // if (distance(userInfoDoc.data().name, newFriendInput) <= (newFriendInput.length/2)){
                        results.push({
                            // distance: distance(userInfoDoc.data().name, newFriendInput),
                            id: userInfoDoc.id,
                            email: userDoc.id, //user's email
                            name: userInfoDoc.data().name,
                            pfp: userInfoDoc.data().pic,
                            dateJoined: userInfoDoc.data().datejoined,
                        })
                    // }else{
                    //     console.log('not a match')
                    // }
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
    
    //send friend request to picked user
    const sendFriendReq = async (userEmail) =>{
        try{
            await addDoc(collection(db, "Users", userEmail, "friendRequest"), {
                requestedUser: localStorage.getItem("userName"),
                reqUserPfp: localStorage.getItem("userPfp"),
                reqUserDate: localStorage.getItem("userDateJoined")
            })
        }catch(error){
            console.log("error ", error);
        }
    }

    //load user's friend req
    const loadFriendReq = async () =>{

    }

    //gets info of the user when pressed on and set its values
    const fetchUserInfo = async (userName) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "Users"));
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
                                        <img src={user.pfp} onClick={() => {fetchUserInfo(user.name)}} alt="userpfp"/>
                                        <div className="userDescOuterContainer">
                                            <h1 onClick={() => {fetchUserInfo(user.name)}}> {user.name} </h1>
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
                                <p> load user request </p>
                            </Modal.Body>
                        </div>
                    </Modal>
                </>
            )}

            <div className="tempBtnContainer" onClick={() =>{setAddFriendPopup(!addFriendPopup)}}>
                <FiUserPlus className="postIcon"/>
                <p> Add Friend </p> 
            </div>
            <div className="tempBtnContainer2" onClick={() =>{setFriendReqPopup(!friendReqPopup)}}>
                <IoMdNotificationsOutline  className="postIcon"/>
                <p> Request </p> 
            </div>
            <section className="pageContainer">
                <Navbar/>
                <section className="friendSection">
                    <h1> Friends </h1>
                    <div className="friendsList">
                        <img src={{}} alt="friend pfp"/>
                        <h1> Name of Friend </h1>
                        <p> Date you became friends </p>
                    </div>
                </section>
            </section>
        </div>
    )
}