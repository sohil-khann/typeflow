import React from 'react';
import styled from '@emotion/styled';

const KeyboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  user-select: none;
`;

const KeyboardRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
`;

const Key = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${props => {
    if (props.isHighlighted) return props.darkMode ? '#61dafb' : '#0066cc';
    if (props.isError) return props.darkMode ? '#f44336' : '#c62828';
    return props.darkMode ? '#333333' : '#e0e0e0';
  }};
  color: ${props => {
    if (props.isHighlighted || props.isError) return '#ffffff';
    return props.darkMode ? '#ffffff' : '#333333';
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
  flex: ${props => props.flex || 1};
`;

const VirtualKeyboard = ({ currentKey, errors, darkMode }) => {
  // Convert errors object to array of mistyped characters
  const errorChars = Object.values(errors);
  
  // Keyboard layout
  const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    [' ']
  ];
  
  return (
    <KeyboardContainer>
      {keyboardLayout.map((row, rowIndex) => (
        <KeyboardRow key={rowIndex}>
          {row.map((key, keyIndex) => {
            const isHighlighted = key.toLowerCase() === currentKey?.toLowerCase();
            const isError = errorChars.includes(key);
            
            return (
              <Key 
                key={keyIndex} 
                isHighlighted={isHighlighted}
                isError={isError}
                darkMode={darkMode}
                flex={key === ' ' ? 6 : 1}
              >
                {key === ' ' ? 'Space' : key.toUpperCase()}
              </Key>
            );
          })}
        </KeyboardRow>
      ))}
    </KeyboardContainer>
  );
};

export default VirtualKeyboard;