import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Fade } from '@mui/material';
import { fetchVendedoras } from '../services/vendedorasService';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

const ANIMATION_DURATION = 3500; // ms

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [highlights, setHighlights] = useState({}); // { id: { diff: number, timeout: NodeJS.Timeout } }
  const prevData = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastHighlights, setLastHighlights] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    // Inicializar o áudio
    audioRef.current = new Audio('/cash.mp3');
  }, []);

  useEffect(() => {
    // Verificar se há novas atualizações em highlights
    const hasNewUpdates = Object.keys(highlights).some(id => !lastHighlights[id]);
    if (hasNewUpdates) {
      audioRef.current.play().catch(e => console.error('Erro ao tocar áudio:', e));
    }
    setLastHighlights(highlights);
  }, [highlights, lastHighlights]);

  useEffect(() => {
    let interval;
    let isMounted = true;
    const fetchAndUpdate = async () => {
      const vendedoras = await fetchVendedoras();
      // Detecta aumentos de valor
      const newHighlights = {};
      vendedoras.forEach((v) => {
        const prev = prevData.current.find((p) => p.id === v.id);
        if (prev && Number(v.valor) > Number(prev.valor)) {
          newHighlights[v.id] = { diff: Number(v.valor) - Number(prev.valor) };
        }
      });
      if (!isMounted) return;
      setSalesData(vendedoras);
      setLastUpdate(Date.now());
      // Ativa animação
      if (Object.keys(newHighlights).length > 0) {
        setHighlights((old) => ({ ...old, ...newHighlights }));
        // Remove destaque após ANIMATION_DURATION
        Object.keys(newHighlights).forEach((id) => {
          setTimeout(() => {
            setHighlights((old) => {
              const copy = { ...old };
              delete copy[id];
              return copy;
            });
          }, ANIMATION_DURATION);
        });
      }
      prevData.current = vendedoras.map((v) => ({ ...v }));
    };
    fetchAndUpdate();
    interval = setInterval(fetchAndUpdate, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Lista de nomes fictícios para preencher o ranking
  const nomesFicticios = [
    'COLABORADOR 1', 'COLABORADOR 2', 'COLABORADOR 3', 'COLABORADOR 4', 'COLABORADOR 5',
    'COLABORADOR 6', 'COLABORADOR 7', 'COLABORADOR 8', 'COLABORADOR 9', 'COLABORADOR 10'
  ];
  // Preencher até 10 posições
  const preenchido = Array.from({ length: 10 }, (_, i) => salesData[i] || { id: `fake${i}`, nome: nomesFicticios[i], valor: 0 });
  // Divide em duas colunas de 5
  const left = preenchido.slice(0, 5);
  const right = preenchido.slice(5, 10);

  // Função para renderizar colaborador com animação
  function renderColaborador(v, idx, pos) {
    const highlight = highlights[v.id];
    return (
      <Box key={v.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ color: '#00bfff', fontWeight: 900, fontSize: 36, width: 50, textAlign: 'right', mr: 2 }}>{pos}º</Typography>
        <Box sx={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: highlight ? '#00ff99' : '#fff',
              fontWeight: 900,
              fontSize: 32,
              textShadow: highlight
                ? '0 0 16px #00ff99, 0 0 8px #fff'
                : '1px 1px 4px #000',
              transition: 'color 0.3s',
            }}
          >
            {v.nome}
          </Typography>
          <Fade in={!!highlight} timeout={{ enter: 300, exit: 500 }}>
            <Box
              sx={{
                position: 'absolute',
                left: '100%',
                ml: 2,
                color: '#00ff99',
                fontWeight: 900,
                fontSize: 24,
                textShadow: '0 0 8px #00ff99',
                animation: highlight ? 'pulse 1.2s infinite alternate' : 'none',
              }}
            >
              +R$ {highlight ? highlight.diff.toLocaleString('pt-BR') : ''}
            </Box>
          </Fade>
        </Box>
        <Typography sx={{ color: '#ffd700', fontWeight: 900, fontSize: 28, minWidth: 160, textAlign: 'right', ml: 2 }}>
          R$ {Number(v.valor).toLocaleString('pt-BR')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      minWidth: '100vw',
      bgcolor: '#181c24',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
      m: 0,
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.15); opacity: 0.7; }
        }
      `}</style>
      <Box sx={{ mb: 2 }}>
        <img src="/logo.png" alt="Logo" style={{ maxWidth: 180, display: 'block', margin: '0 auto' }} />
      </Box>
      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 0, letterSpacing: 2, textShadow: '2px 2px 8px #000' }} align="center">
        TOP 10 Diário
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#aaa', mb: 4, textShadow: '1px 1px 4px #000', fontSize: 32, fontWeight: 700 }} align="center">
        Última atualização: {formatDate(lastUpdate)}
      </Typography>
      <Paper sx={{
        width: { xs: '99vw', sm: '98vw', md: '96vw', lg: '90vw', xl: '85vw' },
        maxWidth: 2000,
        minWidth: 700,
        minHeight: 0,
        background: '#232a36',
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
        p: { xs: 2, sm: 4, md: 6 },
        m: 0,
      }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2, letterSpacing: 1 }}>Colaborador</Typography>
            {left.map((v, idx) => renderColaborador(v, idx, idx + 1))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2, letterSpacing: 1 }}>Colaborador</Typography>
            {right.map((v, idx) => renderColaborador(v, idx, idx + 6))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard; 