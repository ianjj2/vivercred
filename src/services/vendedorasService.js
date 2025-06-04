import { supabase } from './supabaseClient';

const TABLE_NAME = 'vendedoras';

export const fetchVendedoras = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('valor', { ascending: false });
  if (error) {
    console.error('Erro ao buscar vendedoras:', error);
    return [];
  }
  return data;
};

export const addVendedora = async (vendedora) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([
      {
        nome: vendedora.nome,
        valor: Number(vendedora.valor),
        qtd: Number(vendedora.qtd) || 0,
        created_at: new Date().toISOString(),
      },
    ]);
  if (error) throw error;
};

export const updateVendedora = async (id, vendedora) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({
      nome: vendedora.nome,
      valor: Number(vendedora.valor),
      qtd: Number(vendedora.qtd) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
};

export const deleteVendedora = async (id) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  if (error) throw error;
}; 