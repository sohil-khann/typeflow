import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { getUserProfile, saveTypingSession, updateUserPreferences } from './firebase/firebaseService';
import { generatePracticeText, generateSessionFeedback } from './services/geminiService';

// Layout Components
import Header from './components/layout/Header';

// Typing Components
import TypingInterface from './components/typing/TypingInterface';

// CSS
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Load user profile and preferences
          const profile = await getUserProfile(currentUser.uid);
          if (profile && profile.preferences) {
            setUserPreferences(profile.preferences);
            setDarkMode(profile.preferences.darkMode);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update user preferences if logged in
    if (user && userPreferences) {
      const updatedPreferences = {
        ...userPreferences,
        darkMode: newDarkMode
      };
      
      setUserPreferences(updatedPreferences);
      
      try {
        await updateUserPreferences(user.uid, updatedPreferences);
      } catch (error) {
        console.error('Error updating preferences:', error);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Firebase logout is handled in the Header component
  };

  // Save typing session
  const saveSession = async (sessionData) => {
    if (!user) return;
    
    try {
      await saveTypingSession(user.uid, sessionData);
      
      // Generate AI feedback
      const feedback = await generateSessionFeedback(sessionData);
      return feedback;
    } catch (error) {
      console.error('Error saving session:', error);
      return null;
    }
  };

  // Generate AI content for typing practice
  const generateAIContent = async (difficulty) => {
    try {
      return await generatePracticeText(difficulty);
    } catch (error) {
      console.error('Error generating AI content:', error);
      return null;
    }
  };

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          isLoggedIn={!!user} 
          handleLogout={handleLogout} 
        />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="welcome-container">
                  <h1>Welcome to TypeFlow</h1>
                  <p>Improve your typing skills with AI-powered practice sessions</p>
                  <button 
                    className="start-button"
                    onClick={() => window.location.href = '/practice'}
                  >
                    Start Typing
                  </button>
                </div>
              } 
            />
            
            <Route 
              path="/practice" 
              element={
                <TypingInterface 
                  darkMode={darkMode} 
                  user={user} 
                  saveSession={saveSession} 
                  generateAIContent={generateAIContent} 
                />
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                user ? (
                  <div>Analytics Dashboard (Coming Soon)</div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/login" 
              element={
                <div>Login Page (Coming Soon)</div>
              } 
            />
            
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </main>
        
        <ToastContainer position="bottom-right" theme={darkMode ? 'dark' : 'light'} />
      </div>
    </Router>
  )
}

export default App
