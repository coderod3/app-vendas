import { supabase } from "./supabaseClient";

export const clientService = {
  async getTodos() { //getAll
    // Adicionamos o "vendas(valor)" para o Supabase já trazer a matemática junto!
    const { data, error } = await supabase
      .from("clientes")
      .select("*, vendas(valor)")
      .order("criado_em", { ascending: false });

    if (error) throw error;

    // Calcula o total individual já no momento de buscar
    return data.map(cliente => ({
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

  async create(nome, file) { // Adicionamos 'nome' aqui
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);

    const { data, error: dbError } = await supabase
      .from("clientes")
      .insert([{ 
        nome: nome, // Salvamos o nome no banco
        foto_url: publicUrlData.publicUrl 
      }])
      .select().single();
    
    if (dbError) throw dbError;
    return data;
  }
};