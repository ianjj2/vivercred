import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Componentes
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LoginAdmin from './components/LoginAdmin';

// Tema personalizado
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [auth, setAuth] = useState(() => localStorage.getItem('adminAuth') === 'true');
  const handleLogin = () => setAuth(true);
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setAuth(false);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={
            auth ? <>
              <Box sx={{ position: 'absolute', top: 16, right: 24 }}>
                <button onClick={handleLogout} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Sair</button>
              </Box>
              <AdminPanel />
            </> : <LoginAdmin onLogin={handleLogin} />
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 