// import React, { createContext, useState } from 'react';
import { collection, getDocs, getDoc, updateDoc, doc, deleteDoc, addDoc} from "firebase/firestore"; 
import { db } from '../firebaseConfig.js';
import { getDate } from "./helpers.js";

//used to get a user's profile
export const fetchUserInfo = async (userName) => {
    const userInfoArray = [];
    try {
        const usersSnapshot = await getDocs(collection(db, "Users"));
        //loops thru each of the docs to find a matching username 
        for (const userDoc of usersSnapshot.docs) {
            const userInfoSnapshot = await getDocs(collection(db, 'Users', userDoc.id, 'userInfo'));
            userInfoSnapshot.forEach((userInfoDoc) => {
                const userInfoData = userInfoDoc.data();
                console.log("userDoc", userDoc.id);
                if (userInfoData.name === userName) {
                    userInfoArray.push({
                        id: userDoc.id,
                        name: userInfoData.name,
                        desc: userInfoData.profileDesc,
                        date: userInfoData.datejoined,
                        img: userInfoData.pic,
                    })
                }
            });
        }
        return userInfoArray;
    }catch(error) {
        console.error('Error fetching user info:', error);
    }
}

//gets all post that a user has posted
export const getUserPost = async (userEmail) => {
    const userPost = [];
    const postSnapshot = await getDocs(collection(db, "Users", userEmail, "post"));
    postSnapshot.forEach(doc => {
        userPost.push({
            id: doc.id,
            title: doc.data().title,
            desc: doc.data().desc,
            img: doc.data().img,
            user: doc.data().user,
            date: doc.data().date,
            likeCount: doc.data().likeCount,
            commentCount: doc.data().commentCount
        });
    });
    return userPost;
}

//takes in the id of the posted doc and the name of the user who posted
export const likePost = async (postDocId, postUserName) =>{
    const userInfo = await fetchUserInfo(postUserName);
    if(userInfo && userInfo.length > 0){
        var postUserEmail = userInfo[0].id;
    }

    let likedPost = false;
    let userLikedDoc = "";
    try{
        //check if user has liked the post already 
        const docs = await getDocs(collection(db, "Users", localStorage.getItem("userEmail"), "postLiked"))
        docs.forEach((doc) =>{
            if(doc.data().docId === postDocId){
                console.log("user has liked this post already!");
                userLikedDoc = doc.id;
                likedPost = true;
            }
        })

        const docData = await getDoc(doc(db, "Homepage Feed", postDocId));
        //if user has not liked the post
        if(!likedPost){
            //update the like on the post +1 
            await updateDoc(doc(db, "Homepage Feed", postDocId), {
                likeCount: docData.data().likeCount + 1
            })
            //add that liked post to the user's post like list
            await addDoc(collection(db, "Users", localStorage.getItem("userEmail"), "postLiked"),{
                docId: postDocId
            })
            //update the liked post in the user's collection of post (who posted the post)
            await updateDoc(doc(db, "Users", postUserEmail, "post", postDocId),{
                likeCount: docData.data().likeCount + 1
            })
            
        }else{
            //remove + 1 from the current liked post
            await updateDoc(doc(db, "Homepage Feed", postDocId), {
                likeCount: docData.data().likeCount - 1
            })
            await updateDoc(doc(db, "Users", postUserEmail, "post", postDocId),{
                likeCount: docData.data().likeCount - 1
            })
            
            //delete the liked post from the user's liked post
            await deleteDoc(doc(db, "Users", localStorage.getItem("userEmail"), "postLiked", userLikedDoc));
        }
    }catch(error){
        console.log("error ", error);
    }
}

//adds a comment to the post
export const addComment = async (userComment, currPostId) =>{
    //add comment to the doc comment collection
    if(userComment === ""){
        alert("comment cannot be empty");
        return;
    }
    //adds comment to the post doc 
    await addDoc(collection(db, "Homepage Feed", currPostId, "comments"),{
        name: localStorage.getItem("userName"),
        comment: userComment,
        date: getDate(),
        pfp: localStorage.getItem("userPfp")
    })

    //updates the comment count in the homepagefeed and the user's post document
    const docData = await getDoc(doc(db, "Homepage Feed", currPostId));
    await updateDoc(doc(db, "Homepage Feed", currPostId), {
        commentCount: docData.data().commentCount + 1
    })

    await updateDoc(doc(db, "Users", localStorage.getItem("userEmail"), "post", currPostId), {
        commentCount: docData.data().commentCount + 1
    })
}

//loads comments on the clicked post
export const loadComment = async (postId) =>{
    const postDocs = await getDocs(collection(db, "Homepage Feed", postId, "comments"));
    const docComments = postDocs.docs.map(doc =>({
        userCommentName: doc.data().name,
        comment: doc.data().comment,
        date: doc.data().date,
        pfp: doc.data().pfp
    }))
    
    return docComments;
}
