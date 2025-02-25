 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
  apiKey: "AIzaSyDcguTxIJqCgQ3qT-ap6HiTnRZhI7AcaQI",
  authDomain: "reminebebidas.firebaseapp.com",
  projectId: "reminebebidas",
  storageBucket: "reminebebidas.firebasestorage.app",
  messagingSenderId: "996821910868",
  appId: "1:996821910868:web:75a07b4b71e55255e174c1",
  measurementId: "G-4S1QQPS1QW"
};

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 