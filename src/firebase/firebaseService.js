import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './config';

// User Authentication
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      preferences: {
        darkMode: false,
        soundEnabled: true,
        showKeyboard: true
      }
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login timestamp
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// User Data Management
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      'preferences': preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Typing Session Management
export const saveTypingSession = async (userId, sessionData) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving typing session:', error);
    throw error;
  }
};

export const getTypingSessions = async (userId, limit = 10) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(limit));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting typing sessions:', error);
    throw error;
  }
};

// Analytics Data
export const getPerformanceStats = async (userId) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(30));
    const querySnapshot = await getDocs(q);
    
    const sessions = querySnapshot.docs.map(doc => doc.data());
    
    // Calculate average WPM and accuracy
    const avgWpm = sessions.reduce((sum, session) => sum + session.wpm, 0) / sessions.length || 0;
    const avgAccuracy = sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length || 0;
    
    // Get WPM and accuracy trends (last 30 sessions)
    const wpmTrend = sessions.map(session => session.wpm).reverse();
    const accuracyTrend = sessions.map(session => session.accuracy).reverse();
    
    // Calculate most common errors
    const errorMap = {};
    sessions.forEach(session => {
      if (session.errors) {
        session.errors.forEach(error => {
          if (!errorMap[error.character]) {
            errorMap[error.character] = 0;
          }
          errorMap[error.character]++;
        });
      }
    });
    
    const commonErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([character, count]) => ({ character, count }));
    
    return {
      avgWpm,
      avgAccuracy,
      wpmTrend,
      accuracyTrend,
      commonErrors,
      totalSessions: sessions.length
    };
  } catch (error) {
    console.error('Error getting performance stats:', error);
    throw error;
  }
};