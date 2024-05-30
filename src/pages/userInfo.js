import React, {createContext, useState} from 'react';
import { collection, getDocs} from "firebase/firestore"; 
import { db } from '../firebaseConfig.js';

export const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [userData, setUserData] = useState({
        userName: "",
        userEmail: "",
        userPassword: "",
        userPicture: null
    });
    
    //updates any of the userData above
    const updateUserData = (fieldName, newValue) => {
        setUserData(prevData => ({
            ...prevData,
            [fieldName]: newValue
        }));
    };

    return(
        <UserContext.Provider value = {{userData, updateUserData, fetchUserInfo}}>
            {children}
        </UserContext.Provider>
    )
}

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
        });
    });
    return userPost;
}
