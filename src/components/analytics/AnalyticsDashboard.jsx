import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styled from '@emotion/styled';
import { getPerformanceStats, getTypingSessions } from '../../firebase/firebaseService';
import { generateCustomChallenge } from '../../services/geminiService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${props => props.darkMode ? '#aaaaaa' : '#666666'};
`;

const ChartContainer = styled.div`
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
  text-align: center;
`;

const ErrorsContainer = styled.div`
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ErrorsTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
`;

const ErrorsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
`;

const ErrorItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.darkMode ? '#333333' : '#f5f5f5'};
  border-radius: 6px;
`;

const ErrorChar = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.darkMode ? '#f44336' : '#c62828'};
  margin-bottom: 0.5rem;
`;

const ErrorCount = styled.div`
  font-size: 0.9rem;
  color: ${props => props.darkMode ? '#aaaaaa' : '#666666'};
`;

const ChallengeContainer = styled.div`
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
`;

const ChallengeTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
`;

const ChallengeText = styled.p`
  font-family: 'Roboto Mono', monospace;
  line-height: 1.6;
  padding: 1rem;
  background-color: ${props => props.darkMode ? '#333333' : '#f5f5f5'};
  border-radius: 6px;
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
`;

const Button = styled.button`
  background-color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#4dc0e6' : '#0055aa'};
  }
  
  &:disabled {
    background-color: ${props => props.darkMode ? '#555555' : '#cccccc'};
    cursor: not-allowed;
  }
`;

const AnalyticsDashboard = ({ darkMode, user }) => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customChallenge, setCustomChallenge] = useState('');
  const [generatingChallenge, setGeneratingChallenge] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const performanceStats = await getPerformanceStats(user.uid);
        const recentSessions = await getTypingSessions(user.uid, 10);
        
        setStats(performanceStats);
        setSessions(recentSessions);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleGenerateChallenge = async () => {
    if (!user || sessions.length === 0) return;
    
    setGeneratingChallenge(true);
    
    try {
      const challenge = await generateCustomChallenge(sessions);
      setCustomChallenge(challenge);
    } catch (error) {
      console.error('Error generating custom challenge:', error);
    } finally {
      setGeneratingChallenge(false);
    }
  };

  // Prepare chart data
  const wpmChartData = {
    labels: stats?.wpmTrend.map((_, index) => `Session ${index + 1}`) || [],
    datasets: [
      {
        label: 'WPM',
        data: stats?.wpmTrend || [],
        borderColor: darkMode ? '#61dafb' : '#0066cc',
        backgroundColor: darkMode ? 'rgba(97, 218, 251, 0.2)' : 'rgba(0, 102, 204, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const accuracyChartData = {
    labels: stats?.accuracyTrend.map((_, index) => `Session ${index + 1}`) || [],
    datasets: [
      {
        label: 'Accuracy %',
        data: stats?.accuracyTrend || [],
        borderColor: darkMode ? '#4caf50' : '#2e7d32',
        backgroundColor: darkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(46, 125, 50, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const errorChartData = {
    labels: stats?.commonErrors.map(error => error.character) || [],
    datasets: [
      {
        label: 'Error Count',
        data: stats?.commonErrors.map(error => error.count) || [],
        backgroundColor: darkMode ? '#f44336' : '#c62828',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e1e1e1' : '#333333',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#aaaaaa' : '#666666',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? '#aaaaaa' : '#666666',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (!stats) {
    return (
      <div>
        <h2>No data available</h2>
        <p>Complete some typing sessions to see your analytics.</p>
      </div>
    );
  }

  return (
    <DashboardContainer>
      <h2 style={{ color: darkMode ? '#e1e1e1' : '#333333' }}>Your Typing Analytics</h2>
      
      <StatsGrid>
        <StatCard darkMode={darkMode}>
          <StatValue darkMode={darkMode}>{stats.avgWpm.toFixed(1)}</StatValue>
          <StatLabel darkMode={darkMode}>Average WPM</StatLabel>
        </StatCard>
        
        <StatCard darkMode={darkMode}>
          <StatValue darkMode={darkMode}>{stats.avgAccuracy.toFixed(1)}%</StatValue>
          <StatLabel darkMode={darkMode}>Average Accuracy</StatLabel>
        </StatCard>
        
        <StatCard darkMode={darkMode}>
          <StatValue darkMode={darkMode}>{stats.totalSessions}</StatValue>
          <StatLabel darkMode={darkMode}>Total Sessions</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <ChartContainer darkMode={darkMode}>
        <ChartTitle darkMode={darkMode}>WPM Progress</ChartTitle>
        <Line data={wpmChartData} options={chartOptions} />
      </ChartContainer>
      
      <ChartContainer darkMode={darkMode}>
        <ChartTitle darkMode={darkMode}>Accuracy Progress</ChartTitle>
        <Line data={accuracyChartData} options={chartOptions} />
      </ChartContainer>
      
      <ErrorsContainer darkMode={darkMode}>
        <ErrorsTitle darkMode={darkMode}>Common Errors</ErrorsTitle>
        
        <ChartContainer darkMode={darkMode}>
          <Bar data={errorChartData} options={chartOptions} />
        </ChartContainer>
        
        <ErrorsList>
          {stats.commonErrors.map((error, index) => (
            <ErrorItem key={index} darkMode={darkMode}>
              <ErrorChar darkMode={darkMode}>{error.character}</ErrorChar>
              <ErrorCount darkMode={darkMode}>{error.count} errors</ErrorCount>
            </ErrorItem>
          ))}
        </ErrorsList>
      </ErrorsContainer>
      
      <ChallengeContainer darkMode={darkMode}>
        <ChallengeTitle darkMode={darkMode}>Personalized Challenge</ChallengeTitle>
        
        {customChallenge ? (
          <ChallengeText darkMode={darkMode}>{customChallenge}</ChallengeText>
        ) : (
          <p style={{ color: darkMode ? '#aaaaaa' : '#666666' }}>
            Generate a custom typing challenge based on your performance data.
          </p>
        )}
        
        <Button 
          onClick={handleGenerateChallenge} 
          disabled={generatingChallenge || sessions.length === 0} 
          darkMode={darkMode}
        >
          {generatingChallenge ? 'Generating...' : 'Generate Challenge'}
        </Button>
      </ChallengeContainer>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;