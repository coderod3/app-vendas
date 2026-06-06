import { supabase } from "./supabaseClient";

export const clientService = {
  async getAll() {
    // Agora puxamos os clientes e a coluna 'valor' da tabela de vendas associada
    const { data, error } = await supabase
      .from("clientes")
      .select("*, vendas(valor)")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("❌ ERRO DO SUPABASE:", error);
      throw error;
    }

    // Retorna os clientes já com o total de dívida somado
    return (data || []).map(cliente => ({
      ...cliente,
      total_devido: cliente.vendas ? cliente.vendas.reduce((sum, v) => sum + (Number(v.valor) || 0), 0) : 0
    }));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(nome, file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);

    const { data, error: dbError } = await supabase
      .from("clientes")
      .insert([{ 
        nome: nome,
        foto_url: publicUrlData.publicUrl 
      }])
      .select().single();
    
    if (dbError) throw dbError;
    return data;
  }
};