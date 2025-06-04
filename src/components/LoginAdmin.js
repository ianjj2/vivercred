import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';

const USER = 'Comercial@vivercred.com.br';
const PASS = 'Vivercred@2025@';

export default function LoginAdmin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === USER && senha === PASS) {
      localStorage.setItem('adminAuth', 'true');
      onLogin();
    } else {
      setErro('Usuário ou senha inválidos');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181c24' }}>
      <Paper sx={{ p: 4, minWidth: 340, maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Login Administrativo</Typography>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>Entrar</Button>
        </form>
      </Paper>
    </Box>
  );
} 