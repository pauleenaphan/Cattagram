// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5RR1TRURfAfGuojtLKhHwGrpf_msjo9w",
  authDomain: "cattagram-eb62f.firebaseapp.com",
  projectId: "cattagram-eb62f",
  storageBucket: "cattagram-eb62f.appspot.com",
  messagingSenderId: "636720726859",
  appId: "1:636720726859:web:dbe401422201e53ad55ece",
  measurementId: "G-J1J3SF73X1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);