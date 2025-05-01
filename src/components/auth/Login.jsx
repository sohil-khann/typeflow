import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from '@emotion/styled';
import { loginUser, resetPassword } from '../../firebase/firebaseService';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${props => props.darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.darkMode ? '#444444' : '#e0e0e0'};
  border-radius: 4px;
  background-color: ${props => props.darkMode ? '#333333' : '#ffffff'};
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(97, 218, 251, 0.2)' : 'rgba(0, 102, 204, 0.2)'};
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#4dc0e6' : '#0055aa'};
  }
  
  &:disabled {
    background-color: ${props => props.darkMode ? '#555555' : '#cccccc'};
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${props => props.darkMode ? '#aaaaaa' : '#666666'};
  
  a {
    color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ForgotPassword = styled.button`
  background: none;
  border: none;
  color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
  font-size: 0.9rem;
  text-align: right;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Login = ({ darkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await loginUser(email, password);
      toast.success('Logged in successfully');
      navigate('/practice');
    } catch (error) {
      let errorMessage = 'Failed to login';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      await resetPassword(email);
      toast.success('Password reset email sent. Please check your inbox');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <AuthContainer darkMode={darkMode}>
      <Title darkMode={darkMode}>Login to TypeFlow</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label darkMode={darkMode}>Email</Label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
            darkMode={darkMode}
          />
        </FormGroup>
        
        <FormGroup>
          <Label darkMode={darkMode}>Password</Label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
            darkMode={darkMode}
          />
          <ForgotPassword 
            type="button" 
            onClick={handleForgotPassword} 
            darkMode={darkMode}
          >
            Forgot password?
          </ForgotPassword>
        </FormGroup>
        
        <Button 
          type="submit" 
          disabled={loading} 
          darkMode={darkMode}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
      
      <LinkText darkMode={darkMode}>
        Don't have an account? <Link to="/register">Register</Link>
      </LinkText>
    </AuthContainer>
  );
};

export default Login;