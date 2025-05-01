import React from 'react';
import styled from '@emotion/styled';

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.darkMode ? '#333333' : '#f0f0f0'};
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.darkMode ? '#aaaaaa' : '#666666'};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => {
    if (props.type === 'wpm') return props.darkMode ? '#61dafb' : '#0066cc';
    if (props.type === 'accuracy' && props.value < 90) return props.darkMode ? '#f44336' : '#c62828';
    if (props.type === 'accuracy') return props.darkMode ? '#4caf50' : '#2e7d32';
    return props.darkMode ? '#ffffff' : '#333333';
  }};
`;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const TypingStats = ({ wpm, accuracy, timeLeft, isActive, darkMode }) => {
  return (
    <StatsContainer darkMode={darkMode}>
      <StatItem>
        <StatLabel darkMode={darkMode}>WPM</StatLabel>
        <StatValue darkMode={darkMode} type="wpm">
          {isActive || wpm > 0 ? wpm : '-'}
        </StatValue>
      </StatItem>
      
      <StatItem>
        <StatLabel darkMode={darkMode}>Accuracy</StatLabel>
        <StatValue darkMode={darkMode} type="accuracy" value={accuracy}>
          {isActive || accuracy < 100 ? `${accuracy}%` : '-'}
        </StatValue>
      </StatItem>
      
      <StatItem>
        <StatLabel darkMode={darkMode}>Time</StatLabel>
        <StatValue darkMode={darkMode}>
          {isActive ? formatTime(timeLeft) : '-'}
        </StatValue>
      </StatItem>
    </StatsContainer>
  );
};

export default TypingStats;