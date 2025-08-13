const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, addDoc, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyA2eMZxALaf7h0zQ3C-bYT_UtKSHs9HDu4",
  authDomain: "bot-tool-89.firebaseapp.com",
  projectId: "bot-tool-89",
  storageBucket: "bot-tool-89.firebasestorage.app",
  messagingSenderId: "255693007780",
  appId: "1:255693007780:web:2292ef811b8f2469cc6f31",
  measurementId: "G-K246CBWDJE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db, collection, query, where, getDocs, addDoc, updateDoc };



