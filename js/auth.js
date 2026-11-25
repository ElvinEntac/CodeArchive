import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc, getDoc, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const accountBtn = document.getElementById("accountBtn");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authIntro = document.getElementById("authIntro");
const authSubmit = document.getElementById("authSubmit");
const authSwitchText = document.getElementById("authSwitchText");
const authSwitchBtn = document.getElementById("authSwitchBtn");
const confirmPasswordLabel = document.getElementById("confirmPasswordLabel");
const confirmPasswordInput = authForm.elements.confirmPassword;
const authError = document.getElementById("authError");
let authMode = "signup";
let currentUser = null;

// Firebase Email/Password is used behind the scenes with a generated internal address.
// Users only see and enter their username; no real email address is collected.
const INTERNAL_AUTH_DOMAIN = "accounts.codearchive.invalid";
const usernameToEmail = (username) => `${username.toLowerCase()}@${INTERNAL_AUTH_DOMAIN}`;

function openAuth(mode) {
  authMode = mode;
  authError.classList.add("hidden");
  authForm.reset();
  const isSignup = mode === "signup";
  authTitle.innerHTML = isSignup ? 'Create your account<span>.</span>' : 'Welcome back<span>.</span>';
  authIntro.textContent = isSignup
    ? "Choose a username and password to join Code Archive. No email address needed."
    : "Log in using your Code Archive username and password.";
  confirmPasswordLabel.classList.toggle("hidden", !isSignup);
  confirmPasswordInput.required = isSignup;
  authForm.elements.password.autocomplete = isSignup ? "new-password" : "current-password";
  authSubmit.textContent = isSignup ? "Create account" : "Log in";
  authSwitchText.textContent = isSignup ? "Already have an account?" : "New to Code Archive?";
  authSwitchBtn.textContent = isSignup ? "Log in" : "Create an account";
  authModal.classList.remove("hidden");
}

loginBtn?.addEventListener("click", () => openAuth("login"));
signupBtn?.addEventListener("click", () => openAuth("signup"));
authSwitchBtn?.addEventListener("click", () => openAuth(authMode === "signup" ? "login" : "signup"));

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.classList.add("hidden");
  authSubmit.disabled = true;
  authSubmit.textContent = authMode === "signup" ? "Creating account..." : "Logging in...";

  const form = new FormData(authForm);
  const username = String(form.get("username") || "").trim();
  const usernameLower = username.toLowerCase();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");
  const internalEmail = usernameToEmail(username);

  try {
    if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) {
      throw new Error("Username must be 3–20 characters and use only letters, numbers, dots, or underscores.");
    }
    if (password.length < 8) throw new Error("Your password must be at least 8 characters long.");

    if (authMode === "signup") {
      if (password !== confirmPassword) throw new Error("The passwords do not match.");

      const credential = await createUserWithEmailAndPassword(auth, internalEmail, password);
      try {
        await updateProfile(credential.user, { displayName: username });
        await runTransaction(db, async (transaction) => {
          const usernameRef = doc(db, "usernames", usernameLower);
          const usernameSnap = await transaction.get(usernameRef);
          if (usernameSnap.exists()) throw new Error("That username is already taken. Please choose another one.");

          const profileRef = doc(db, "users", credential.user.uid);
          transaction.set(usernameRef, {
            uid: credential.user.uid,
            username,
            usernameLower,
            createdAt: serverTimestamp()
          });
          transaction.set(profileRef, {
            uid: credential.user.uid,
            username,
            usernameLower,
            displayName: username,
            bio: "",
            skills: [],
            createdAt: serverTimestamp()
          });
        });
      } catch (error) {
        // Do not leave an unusable authentication account if username reservation fails.
        await deleteUser(credential.user).catch(() => {});
        throw error;
      }
    } else {
      const usernameSnap = await getDoc(doc(db, "usernames", usernameLower));
      if (!usernameSnap.exists()) throw new Error("Username or password is incorrect.");
      const credential = await signInWithEmailAndPassword(auth, usernameToEmail(usernameSnap.data().username), password);
      const profileRef = doc(db, "users", credential.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        throw new Error("Your account profile could not be found. Please contact the site administrator.");
      }
    }

    authModal.classList.add("hidden");
    authForm.reset();
    showToast(authMode === "signup" ? "Your Code Archive account is ready." : "Welcome back!");
  } catch (error) {
    authError.textContent = friendlyError(error);
    authError.classList.remove("hidden");
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = authMode === "signup" ? "Create account" : "Log in";
  }
});

accountBtn?.addEventListener("click", async () => {
  if (!currentUser) return;
  const username = currentUser.displayName || "your account";
  const shouldLogout = confirm(`Signed in as ${username}.\n\nPress OK to log out.`);
  if (shouldLogout) {
    try { await signOut(auth); showToast("You have logged out."); }
    catch { showToast("Could not log out. Please try again."); }
  }
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  loginBtn?.classList.toggle("hidden", !!user);
  signupBtn?.classList.toggle("hidden", !!user);
  accountBtn?.classList.toggle("hidden", !user);
  if (user) {
    accountBtn.textContent = user.displayName || "My account";
    accountBtn.title = user.displayName || "";
  }
});

function friendlyError(error) {
  if (error.message?.includes("already taken") || error.message?.includes("Username must") || error.message?.includes("password") || error.message?.includes("profile could not")) return error.message;
  const messages = {
    "auth/email-already-in-use": "That username is already registered. Try logging in or choose another username.",
    "auth/invalid-email": "That username could not be used. Please choose another one.",
    "auth/weak-password": "Use a password with at least 8 characters.",
    "auth/invalid-credential": "Username or password is incorrect.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "permission-denied": "The database rules blocked this action. Publish the updated firestore.rules file in Firebase."
  };
  return messages[error.code] || error.message || "Something went wrong. Please try again.";
}
