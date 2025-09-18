// Firebase config and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCUg86E2JgYan1bboaoLTvkFw6YEexp_lk",
  authDomain: "edubeacon-375fb.firebaseapp.com",
  projectId: "edubeacon-375fb",
  storageBucket: "edubeacon-375fb.firebasestorage.app",
  messagingSenderId: "544303702084",
  appId: "1:544303702084:web:4256ec0fba1d42baa6dc11",
  measurementId: "G-KZJYW0ESP5"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
