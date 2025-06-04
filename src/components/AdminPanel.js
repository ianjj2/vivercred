import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchVendedoras, addVendedora, updateVendedora, deleteVendedora } from '../services/vendedorasService';

const AdminPanel = () => {
  const [vendedoras, setVendedoras] = useState([]);
  const [novaVendedora, setNovaVendedora] = useState({ nome: '', valor: '' });
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let interval;
    let isMounted = true;
    const fetchAndUpdate = async () => {
      const vendedoras = await fetchVendedoras();
      if (!isMounted) return;
      setVendedoras(vendedoras);
    };
    fetchAndUpdate();
    interval = setInterval(fetchAndUpdate, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAddVendedora = async () => {
    if (novaVendedora.nome && novaVendedora.valor) {
      try {
        await addVendedora(novaVendedora);
        setNovaVendedora({ nome: '', valor: '' });
        setSnackbar({
          open: true,
          message: 'Vendedora adicionada com sucesso!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao adicionar vendedora',
          severity: 'error'
        });
      }
    }
  };

  const handleEditVendedora = (id) => {
    setEditando(id);
  };

  const handleSaveEdit = async (id) => {
    try {
      const vendedora = vendedoras.find(v => v.id === id);
      await updateVendedora(id, vendedora);
      setEditando(null);
      setSnackbar({
        open: true,
        message: 'Vendedora atualizada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar vendedora',
        severity: 'error'
      });
    }
  };

  const handleDeleteVendedora = async (id) => {
    try {
      await deleteVendedora(id);
      setSnackbar({
        open: true,
        message: 'Vendedora removida com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao remover vendedora',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo - Vendedoras
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Nome da Vendedora"
            value={novaVendedora.nome}
            onChange={(e) => setNovaVendedora({ ...novaVendedora, nome: e.target.value })}
            fullWidth
          />
          <TextField
            label="Valor"
            type="number"
            value={novaVendedora.valor}
            onChange={(e) => setNovaVendedora({ ...novaVendedora, valor: e.target.value })}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVendedora}
          >
            Adicionar
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendedoras.map((vendedora) => (
              <TableRow key={vendedora.id}>
                <TableCell>
                  {editando === vendedora.id ? (
                    <TextField
                      value={vendedora.nome}
                      onChange={(e) => {
                        const novasVendedoras = vendedoras.map(v =>
                          v.id === vendedora.id ? { ...v, nome: e.target.value } : v
                        );
                        setVendedoras(novasVendedoras);
                      }}
                    />
                  ) : (
                    vendedora.nome
                  )}
                </TableCell>
                <TableCell align="right">
                  {editando === vendedora.id ? (
                    <TextField
                      type="number"
                      value={vendedora.valor}
                      onChange={(e) => {
                        const novasVendedoras = vendedoras.map(v =>
                          v.id === vendedora.id ? { ...v, valor: e.target.value } : v
                        );
                        setVendedoras(novasVendedoras);
                      }}
                    />
                  ) : (
                    `R$ ${Number(vendedora.valor).toLocaleString('pt-BR')}`
                  )}
                </TableCell>
                <TableCell align="center">
                  {editando === vendedora.id ? (
                    <IconButton color="primary" onClick={() => handleSaveEdit(vendedora.id)}>
                      <EditIcon />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEditVendedora(vendedora.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteVendedora(vendedora.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel; 