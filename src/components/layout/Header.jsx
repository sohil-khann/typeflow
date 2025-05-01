import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styled from '@emotion/styled';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#ffffff'};
  color: ${props => props.darkMode ? '#ffffff' : '#333333'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.darkMode ? '#e1e1e1' : '#333333'};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.darkMode ? '#61dafb' : '#0066cc'};
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.darkMode ? '#ffffff' : '#333333'};
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = ({ darkMode, toggleDarkMode, isLoggedIn, handleLogout }) => {
  return (
    <HeaderContainer darkMode={darkMode}>
      <Logo darkMode={darkMode}>TypeFlow</Logo>
      <Nav>
        <NavLink to="/" darkMode={darkMode}>Home</NavLink>
        <NavLink to="/practice" darkMode={darkMode}>Practice</NavLink>
        <NavLink to="/analytics" darkMode={darkMode}>Analytics</NavLink>
        {isLoggedIn ? (
          <NavLink 
            to="/" 
            darkMode={darkMode} 
            onClick={() => {
              handleLogout();
              toast.success('Logged out successfully');
            }}
          >
            Logout
          </NavLink>
        ) : (
          <NavLink to="/login" darkMode={darkMode}>Login</NavLink>
        )}
      </Nav>
      <ThemeToggle 
        onClick={toggleDarkMode} 
        darkMode={darkMode}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </ThemeToggle>
    </HeaderContainer>
  );
};

export default Header;