
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL0xrjt7viCK3oLasbLhDbF54ZjNm2EDw",
  authDomain: "codearchive-e190f.firebaseapp.com",
  projectId: "codearchive-e190f",
  storageBucket: "codearchive-e190f.firebasestorage.app",
  messagingSenderId: "209412208208",
  appId: "1:209412208208:web:f04614a9eb44869634c355"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
