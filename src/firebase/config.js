// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCHmDNGOYEy0naCEikm6qnNAeCM_vzzDxE",
    authDomain: "typeflow-ddhyv.firebaseapp.com",
    projectId: "typeflow-ddhyv",
    storageBucket: "typeflow-ddhyv.firebasestorage.app",
    messagingSenderId: "897821486452",
    appId: "1:897821486452:web:ef319d1f7ec7b968685021",
    measurementId: "G-E6S7Q0FBHJ"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };

// Example Firestore security rules (to be implemented in Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Typing sessions
    match /users/{userId}/sessions/{sessionId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public content like practice texts
    match /practiceTexts/{textId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
*/