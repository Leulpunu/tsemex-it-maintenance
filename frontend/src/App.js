import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import RequestForm from './components/RequestForm';
import Reports from './components/Reports';
import { lightTheme, darkTheme } from './themes';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: background-color 0.3s, color 0.3s;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: transparent;
  color: white;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.5rem;
`;

const LogoImage = styled.img`
  height: 40px;
  margin-right: 10px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${props => props.theme.text};
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
`;

const LanguageToggle = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  &:hover {
    background-color: ${props => props.theme.accent};
  }
`;



const LogoutButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  &:hover {
    background-color: ${props => props.theme.accent};
  }
`;

const Main = styled.main`
  padding: 2rem;
`;

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and set user
      axios.get('http://localhost:5000/api/auth/verify')
        .then(response => setUser(response.data.user))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <AppContainer>
        <Router>
          <Header>
            <Logo>
              <LogoImage src="/tsemex_cover logo.png" alt="Tsemex Logo" />
            </Logo>
            <HeaderTitle>Tsemex Global IT Support Request</HeaderTitle>
            <div style={{ flex: 1 }}></div>
            {user && (
              <div>
                <span>{t('common.welcome')}, {user.username}</span>
                <LogoutButton onClick={logout}>{t('common.logout')}</LogoutButton>
                <LanguageToggle onClick={toggleLanguage}>
                  {i18n.language === 'en' ? 'አማርኛ' : 'English'}
                </LanguageToggle>
                <ThemeToggle onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </ThemeToggle>
              </div>
            )}
          </Header>
          <Main>
            <Routes>
              <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
              <Route path="/signup" element={!user ? <Signup onSignup={login} /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
              <Route path="/reports" element={user && (user.role === 'admin' || user.role === 'manager') ? <Reports /> : <Navigate to="/dashboard" />} />
              <Route path="/request" element={user ? <RequestForm user={user} /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
          </Main>
        </Router>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
