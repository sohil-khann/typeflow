import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import VirtualKeyboard from './VirtualKeyboard';
import TypingStats from './TypingStats';

const TypingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#f5f5f5'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TextDisplay = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 1.25rem;
  line-height: 1.6;
  background-color: ${props => props.darkMode ? '#333333' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 200px;
  position: relative;
`;

const Character = styled.span`
  color: ${props => {
    if (props.status === 'current') return props.darkMode ? '#61dafb' : '#0066cc';
    if (props.status === 'correct') return props.darkMode ? '#4caf50' : '#2e7d32';
    if (props.status === 'incorrect') return props.darkMode ? '#f44336' : '#c62828';
    return props.darkMode ? '#e1e1e1' : '#333333';
  }};
  background-color: ${props => props.status === 'current' ? (props.darkMode ? '#3a3a3a' : '#e6f7ff') : 'transparent'};
  text-decoration: ${props => props.status === 'incorrect' ? 'underline' : 'none'};
  font-weight: ${props => props.status === 'current' ? 'bold' : 'normal'};
`;

const InputArea = styled.textarea`
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background-color: ${props => props.darkMode ? '#333333' : '#0066cc'};
  color: ${props => props.darkMode ? '#ffffff' : '#ffffff'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#444444' : '#0055aa'};
  }
  
  &:disabled {
    background-color: ${props => props.darkMode ? '#555555' : '#cccccc'};
    cursor: not-allowed;
  }
`;

const SelectControl = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${props => props.darkMode ? '#555555' : '#cccccc'};
  background-color: ${props => props.darkMode ? '#333333' : '#ffffff'};
  color: ${props => props.darkMode ? '#ffffff' : '#333333'};
  font-size: 1rem;
`;

const TypingInterface = ({ darkMode, user, saveSession, generateAIContent }) => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('timed'); // timed, wordCount, custom, ai
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(60); // seconds
  const [wordCount, setWordCount] = useState(50);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  // Sample texts for different difficulty levels
  const sampleTexts = {
    beginner: "The quick brown fox jumps over the lazy dog. Simple sentences help build typing confidence and speed. Practice makes perfect when learning to type. Keep your fingers on the home row keys. Look at the screen instead of your keyboard. Try to maintain a steady rhythm as you type each word. Focus on accuracy first, then gradually increase your speed.",
    intermediate: "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages. Developers need to understand algorithms, data structures, and system architecture to write efficient code. Version control systems like Git help teams collaborate on projects. Testing and debugging are essential parts of the software development lifecycle. Good documentation makes code more maintainable and accessible to other developers.",
    advanced: "The efficacy of quantum computing relies on the principles of superposition and entanglement, allowing for exponential parallelism in computational processes that would otherwise be intractable using classical computing paradigms. Cryptographic systems predicated on mathematical complexity may become vulnerable to quantum algorithms such as Shor's, necessitating the development of post-quantum cryptography. The implementation of error correction in quantum systems remains a significant challenge due to the fragility of quantum states and their susceptibility to decoherence. Quantum machine learning algorithms leverage quantum properties to potentially accelerate training and inference in artificial intelligence applications, though practical advantages remain speculative."
  };

  // Sound effects
  const keyPressSound = new Audio('/sounds/keypress.mp3');
  const errorSound = new Audio('/sounds/error.mp3');
  
  useEffect(() => {
    // Initialize with sample text based on difficulty
    setText(sampleTexts[difficulty]);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  useEffect(() => {
    // Timer logic for timed mode
    if (isActive && mode === 'timed') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  useEffect(() => {
    // Calculate WPM and accuracy in real-time
    if (isActive && startTime) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0) {
        // Words are standardized to 5 characters
        const words = userInput.length / 5;
        setWpm(Math.round(words / elapsedMinutes));
        
        // Calculate accuracy
        const errorCount = Object.keys(errors).length;
        const totalChars = currentIndex;
        const accuracyValue = totalChars > 0 ? ((totalChars - errorCount) / totalChars) * 100 : 100;
        setAccuracy(Math.round(accuracyValue));
      }
    }
  }, [userInput, startTime, isActive, currentIndex, errors]);

  const startSession = async () => {
    // Reset session state
    setUserInput('');
    setCurrentIndex(0);
    setErrors({});
    setStartTime(Date.now());
    setEndTime(null);
    setTimeLeft(duration);
    setIsActive(true);
    setWpm(0);
    setAccuracy(100);
    
    // If AI mode, generate content
    if (mode === 'ai') {
      try {
        const aiText = await generateAIContent(difficulty);
        setText(aiText || sampleTexts[difficulty]); // Fallback to sample if AI fails
      } catch (error) {
        toast.error('Failed to generate AI content. Using sample text instead.');
        setText(sampleTexts[difficulty]);
      }
    }
    
    // Focus the input after a short delay to ensure it works
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const endSession = () => {
    setIsActive(false);
    setEndTime(Date.now());
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Save session data if user is logged in
    if (user) {
      const sessionData = {
        date: new Date(),
        duration: (endTime || Date.now()) - startTime,
        wpm,
        accuracy,
        mode,
        difficulty,
        errors: Object.keys(errors).map(index => ({
          character: text[index],
          position: parseInt(index)
        })),
        completed: currentIndex === text.length,
        textLength: text.length,
        charsTyped: currentIndex
      };
      
      saveSession(sessionData);
    }
  };

  const handleInputChange = (e) => {
    if (!isActive) return;
    
    const inputValue = e.target.value;
    
    // Ensure we're only processing the latest character
    if (inputValue.length > userInput.length) {
      // Get the latest character typed
      const typedChar = inputValue[inputValue.length - 1];
      const currentChar = text[currentIndex];
      
      // Play sound if enabled
      if (soundEnabled) {
        if (currentChar === typedChar) {
          keyPressSound.currentTime = 0;
          keyPressSound.play().catch(() => {});
        } else {
          errorSound.currentTime = 0;
          errorSound.play().catch(() => {});
        }
      }
      
      // Track errors
      if (currentChar !== typedChar) {
        setErrors(prev => ({
          ...prev,
          [currentIndex]: typedChar
        }));
      }
      
      // Update current index
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (inputValue.length < userInput.length) {
      // Handle backspace
      setCurrentIndex(inputValue.length);
    }
    
    // Update user input
    setUserInput(inputValue);
    
    // Check if completed in word count mode
    if (mode === 'wordCount' && inputValue.length >= text.length) {
      endSession();
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let status = 'upcoming';
      
      if (index < currentIndex) {
        status = errors[index] ? 'incorrect' : 'correct';
      } else if (index === currentIndex) {
        status = 'current';
      }
      
      return (
        <Character 
          key={index} 
          status={status} 
          darkMode={darkMode}
        >
          {char}
        </Character>
      );
    });
  };

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    
    // Reset session when changing mode
    setIsActive(false);
    setUserInput('');
    setCurrentIndex(0);
    setErrors({});
    
    // Set appropriate text based on mode
    if (newMode === 'custom') {
      setText('Type your custom text here...');
    } else {
      setText(sampleTexts[difficulty]);
    }
  };

  const handleCustomTextChange = (e) => {
    if (mode === 'custom' && !isActive) {
      setText(e.target.value);
    }
  };

  const handleChangeAIText = async () => {
    if (mode === 'ai' && !isActive) {
      try {
        // Show loading toast
        const loadingToastId = toast.info('Generating new text...', { autoClose: false });
        
        console.log('Calling generateAIContent with difficulty:', difficulty);
        const aiText = await generateAIContent(difficulty);
        console.log('AI text generation result:', aiText ? 'Success' : 'Failed');
        
        // Close loading toast
        toast.dismiss(loadingToastId);
        
        if (aiText) {
          setText(aiText);
          toast.success('New AI text generated successfully!');
        } else {
          console.error('AI text generation returned null or empty string');
          toast.error('Failed to generate new AI text. The API returned no content.');
          setText(sampleTexts[difficulty]); // Fallback to sample text
        }
      } catch (error) {
        console.error('Detailed error in handleChangeAIText:', error);
        toast.error(`Error generating AI text: ${error.message || 'Unknown error'}`);
        setText(sampleTexts[difficulty]); // Fallback to sample text
      }
    }
  };

  return (
    <TypingContainer darkMode={darkMode}>
      <ControlsContainer>
        <div>
          <SelectControl 
            value={mode} 
            onChange={handleModeChange} 
            disabled={isActive}
            darkMode={darkMode}
          >
            <option value="timed">Timed Test</option>
            <option value="wordCount">Word Count</option>
            <option value="custom">Custom Text</option>
            <option value="ai">AI Generated</option>
          </SelectControl>
          
          {mode === 'timed' && (
            <SelectControl 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))} 
              disabled={isActive}
              darkMode={darkMode}
            >
              <option value={60}>1 Minute</option>
              <option value={180}>3 Minutes</option>
              <option value={300}>5 Minutes</option>
            </SelectControl>
          )}
          
          {mode === 'wordCount' && (
            <SelectControl 
              value={wordCount} 
              onChange={(e) => setWordCount(Number(e.target.value))} 
              disabled={isActive}
              darkMode={darkMode}
            >
              <option value={25}>25 Words</option>
              <option value={50}>50 Words</option>
              <option value={100}>100 Words</option>
            </SelectControl>
          )}
          
          <SelectControl 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)} 
            disabled={isActive || mode === 'custom'}
            darkMode={darkMode}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </SelectControl>
          
          {mode === 'ai' && !isActive && (
            <Button 
              onClick={handleChangeAIText} 
              darkMode={darkMode}
              style={{ marginLeft: '10px' }}
            >
              Change Text
            </Button>
          )}
        </div>
        
        <div>
          <Button 
            onClick={isActive ? endSession : startSession} 
            darkMode={darkMode}
          >
            {isActive ? 'End Test' : 'Start Test'}
          </Button>
        </div>
      </ControlsContainer>
      
      <TextDisplay 
        darkMode={darkMode} 
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // If not active and can start, start the session
            if (!isActive && mode !== 'custom') {
              startSession();
            }
          }
        }}
      >
        {mode === 'custom' && !isActive ? (
          <textarea 
            value={text} 
            onChange={handleCustomTextChange} 
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: 'transparent',
              color: darkMode ? '#e1e1e1' : '#333333',
              border: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit'
            }}
          />
        ) : (
          renderText()
        )}
        <InputArea 
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onBlur={() => isActive && inputRef.current?.focus()}
          disabled={!isActive}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          tabIndex="0"
        />
      </TextDisplay>
      
      <TypingStats 
        wpm={wpm} 
        accuracy={accuracy} 
        timeLeft={timeLeft} 
        isActive={isActive} 
        darkMode={darkMode} 
      />
      
      {showKeyboard && (
        <VirtualKeyboard 
          currentKey={text[currentIndex]} 
          errors={errors}
          darkMode={darkMode} 
        />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          onClick={() => setShowKeyboard(!showKeyboard)} 
          darkMode={darkMode}
        >
          {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
        </Button>
        
        <Button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          darkMode={darkMode}
        >
          {soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
        </Button>
      </div>
    </TypingContainer>
  );
};

export default TypingInterface;