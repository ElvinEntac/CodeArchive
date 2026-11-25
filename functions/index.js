const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
initializeApp();
const db=getFirestore();
const cleanUsername=value=>String(value||"").trim();
const usernameKey=value=>cleanUsername(value).toLowerCase();
const validUsername=value=>/^[A-Za-z0-9_.]{3,20}$/.test(value);
const validPassword=value=>typeof value==="string"&&value.length>=8&&value.length<=128;
const adminUsername=String(process.env.CODE_ARCHIVE_ADMIN_USERNAME||"").toLowerCase();
exports.createAccount=onCall({region:"asia-southeast1",enforceAppCheck:false},async request=>{
 const username=cleanUsername(request.data?.username),key=usernameKey(username),password=request.data?.password;
 if(!validUsername(username)||!validPassword(password))throw new HttpsError("invalid-argument","Use a 3–20 character username and a password of at least 8 characters.");
 const nameRef=db.collection("usernames").doc(key);const existing=await nameRef.get();if(existing.exists)throw new HttpsError("already-exists","That username is already taken.");
 const uid=crypto.randomUUID();const passwordHash=await bcrypt.hash(password,12);const isAdmin=!!adminUsername&&key===adminUsername;
 try{await getAuth().createUser({uid,displayName:username});if(isAdmin)await getAuth().setCustomUserClaims(uid,{admin:true});await db.runTransaction(async tx=>{const check=await tx.get(nameRef);if(check.exists)throw new HttpsError("already-exists","That username is already taken.");tx.create(nameRef,{uid,username,usernameLower:key,createdAt:FieldValue.serverTimestamp()});tx.create(db.collection("privateCredentials").doc(uid),{usernameLower:key,passwordHash,createdAt:FieldValue.serverTimestamp()});tx.create(db.collection("users").doc(uid),{uid,username,usernameLower:key,createdAt:FieldValue.serverTimestamp()});});const token=await getAuth().createCustomToken(uid,isAdmin?{admin:true}:{});return {token};
 }catch(error){await getAuth().deleteUser(uid).catch(()=>{});await db.collection("privateCredentials").doc(uid).delete().catch(()=>{});await db.collection("users").doc(uid).delete().catch(()=>{});throw error;}
});
exports.loginAccount=onCall({region:"asia-southeast1",enforceAppCheck:false},async request=>{
 const key=usernameKey(request.data?.username),password=request.data?.password;if(!key||!validPassword(password))throw new HttpsError("invalid-argument","Enter your username and password.");
 const nameSnap=await db.collection("usernames").doc(key).get();if(!nameSnap.exists)throw new HttpsError("unauthenticated","Username or password is incorrect.");const uid=nameSnap.data().uid;const credential=await db.collection("privateCredentials").doc(uid).get();if(!credential.exists||!(await bcrypt.compare(password,credential.data().passwordHash)))throw new HttpsError("unauthenticated","Username or password is incorrect.");
 const isAdmin=!!adminUsername&&key===adminUsername;await getAuth().setCustomUserClaims(uid,isAdmin?{admin:true}:{});return {token:await getAuth().createCustomToken(uid,isAdmin?{admin:true}:{})};
});
