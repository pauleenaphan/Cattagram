import React, {createContext, useState} from 'react';

export const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [userData, setUserData] = useState({
        userName: "",
        userEmail: "",
        userPassword: ""
    });
    
    //updates any of the userData above
    const updateUserData = (fieldName, newValue) => {
        setUserData(prevData => ({
            ...prevData,
            [fieldName]: newValue
        }));
    };
    
    return(
        <UserContext.Provider value = {{userData, updateUserData}}>
            {children}
        </UserContext.Provider>
    )
}