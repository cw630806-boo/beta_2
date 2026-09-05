import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFj4H1cd1x17p-_lQ9YRASFJASOSh54mU",
  authDomain: "ahmedcoaching1-b9492.firebaseapp.com",
  projectId: "ahmedcoaching1-b9492",
  storageBucket: "ahmedcoaching1-b9492.firebasestorage.app",
  messagingSenderId: "123796085799",
  appId: "1:123796085799:web:7dbeeb29ca9b9693748202"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);