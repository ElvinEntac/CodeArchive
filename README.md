# Code Archive — starter prototype

## Files
- `index.html`
- `css/style.css`
- `js/script.js`

## Run it
Open `index.html` in a browser, or upload the folder to a GitHub repository and enable GitHub Pages.

## Current prototype features
- Responsive Code Archive landing page
- Sample project cards
- Search by project title, creator, description, or language
- HTML, CSS, JavaScript, and Java filter
- Featured, newest, and highest-rated sorting
- Project details modal
- Add projects and save them in the current browser using localStorage
- Upload confirmation that requires copying an editing key
- Editing/deleting a locally uploaded project with its editing key

## Important limitations
This is a front-end prototype only. It does NOT yet have real accounts, cloud storage, cross-device project ownership, actual reviews, commission requests, private chat, notifications, or secure admin controls. Browser localStorage is not secure and only stores data on the current browser. Do not use this prototype's editing key as production security.

The next stage should connect Firebase Authentication and Firestore, with server-enforced security rules and a proper data model for users, projects, reviews, commission requests, conversations, and messages.


## Stage 2: Firebase account foundation
This version adds username/password registration and login, plus a Firestore user profile document. Users do not enter an email address.

### Firebase setup
1. Create a project in Firebase Console.
2. Add a Web App and copy the web app config.
3. Paste the config values into `js/firebase-config.js`.
4. In Firebase Authentication, enable the Email/Password provider. The site uses this provider behind the scenes with a generated internal address based on each username; users do not provide or need a real email address.
5. Create a Firestore database.
6. Open Firestore Rules and publish the contents of `firestore.rules`.
7. In Firebase Authentication > Settings > Authorized domains, add your GitHub Pages domain (for example, `yourname.github.io`).

### Important
Until the Firebase config is filled in and Authentication/Firestore are enabled, login and signup will not work. Open the site using a local web server or GitHub Pages; ES modules generally do not work when opening the HTML as a `file://` URL.

Usernames are stored in a `usernames` collection so the site can look them up at login. Username records are reserved and cannot be changed or deleted from the public client in this stage. If a user forgets their password, there is no email-based reset yet; an administrator-managed recovery process will need to be added later. Users should keep their password safe.

This stage only creates accounts and basic profile records. Projects are still browser-local in this prototype. Real cloud project ownership, reviews, commissions, private chat, notifications, and admin permissions are later stages. Do not deploy with open Firestore rules.
