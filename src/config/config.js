// module.exports = {
//   "LOGIN": "https://order.yodobashi.com/yc/login/index.html?returnUrl=https%3A%2F%2Fwww.yodobashi.com%2F%3Flogout%3Dtrue%26yclogout%3Dtrue",
//   "PRODUCT_URL": "https://www.yodobashi.com/product-detail/100000001005084566/",
//   "USER_NAME": "trongtuan2707@gmail.com",
//   "USER_PASSWORD": "Tuan1995",
//   "RUN_AT": "01:30",
//   "credit_Code": "08880",
//   "passWord": "703",
//   "code_Confirm": "000777"
// };


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2eMZxALaf7h0zQ3C-bYT_UtKSHs9HDu4",
  authDomain: "bot-tool-89.firebaseapp.com",
  projectId: "bot-tool-89",
  storageBucket: "bot-tool-89.firebasestorage.app",
  messagingSenderId: "255693007780",
  appId: "1:255693007780:web:2292ef811b8f2469cc6f31",
  measurementId: "G-K246CBWDJE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);