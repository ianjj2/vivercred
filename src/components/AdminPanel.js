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
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchVendedoras, addVendedora, updateVendedora, deleteVendedora } from '../services/vendedorasService';
import { supabase } from '../services/supabaseClient';

const AdminPanel = () => {
  const [vendedoras, setVendedoras] = useState([]);
  const [novaVendedora, setNovaVendedora] = useState({ nome: '', valor: '' });
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tab, setTab] = useState(0);
  const [valoresMensais, setValoresMensais] = useState({});

  useEffect(() => {
    let interval;
    let isMounted = true;
    const fetchAndUpdate = async () => {
      const vendedoras = await fetchVendedoras();
      if (!isMounted) return;
      setVendedoras(vendedoras);
      // Inicializa valores mensais se não estiverem setados
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const mensalMap = {};
      vendedoras.forEach((v) => {
        const data = v.created_at || v.updated_at;
        if (data) {
          const d = new Date(data);
          if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
            if (!mensalMap[v.nome]) mensalMap[v.nome] = 0;
            mensalMap[v.nome] += Number(v.valor);
          }
        }
      });
      setValoresMensais(mensalMap);
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

  // Atualização dos valores mensais (apenas local, para exemplo)
  const handleChangeValorMensal = (nome, valor) => {
    setValoresMensais((prev) => ({ ...prev, [nome]: valor }));
  };

  // Função de fechamento diário manual
  const handleFechamentoDiario = async () => {
    const { data: vendedoras, error } = await supabase
      .from('vendedoras')
      .select('*');
    if (error) {
      setSnackbar({ open: true, message: 'Erro ao buscar vendedoras', severity: 'error' });
      return;
    }
    for (const v of vendedoras) {
      const valorDiario = Number(v.valor) || 0;
      const valorMensal = Number(v.valor_mensal) || 0;
      await supabase
        .from('vendedoras')
        .update({
          valor: 0,
          valor_mensal: valorMensal + valorDiario,
          updated_at: new Date().toISOString(),
        })
        .eq('id', v.id);
    }
    setSnackbar({ open: true, message: 'Fechamento diário realizado com sucesso!', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo - Vendedoras
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleFechamentoDiario}>
            Fechamento Diário
          </Button>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Atualização Diária" />
          <Tab label="Atualização Mensal" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ mt: 2 }}>
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
            <TableContainer>
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
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ mt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell align="right">Valor Mensal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(valoresMensais).map((nome) => (
                    <TableRow key={nome}>
                      <TableCell>{nome}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={valoresMensais[nome]}
                          onChange={(e) => handleChangeValorMensal(nome, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              * Os valores mensais são calculados automaticamente com base nos lançamentos do mês.
            </Typography>
          </Box>
        )}
      </Paper>
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
