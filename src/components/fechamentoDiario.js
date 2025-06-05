// Script de fechamento diário para Supabase
// Soma o valor diário ao mensal e zera o valor diário

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xxpvouzikaaouyxrhuzc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cHZvdXppa2Fhb3V5eHJodXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTUzNzgsImV4cCI6MjA2NDYzMTM3OH0.OlvLCCMRboHrDoA422ztqhSr70RO3zxd3CzQ5KM50QI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE_NAME = 'vendedoras';

async function fechamentoDiario() {
  // 1. Buscar todos os colaboradores
  const { data: vendedoras, error } = await supabase
    .from(TABLE_NAME)
    .select('*');
  if (error) {
    console.error('Erro ao buscar vendedoras:', error);
    return;
  }

  // 2. Para cada colaborador, somar valor diário ao mensal e zerar o diário
  for (const v of vendedoras) {
    const valorDiario = Number(v.valor) || 0;
    const valorMensal = Number(v.valor_mensal) || 0;
    await supabase
      .from(TABLE_NAME)
      .update({
        valor: 0,
        valor_mensal: valorMensal + valorDiario,
        updated_at: new Date().toISOString(),
      })
      .eq('id', v.id);
    console.log(`Colaborador ${v.nome}: diário (${valorDiario}) somado ao mensal (${valorMensal}) e diário zerado.`);
  }
  console.log('Fechamento diário concluído!');
}

fechamentoDiario(); 
