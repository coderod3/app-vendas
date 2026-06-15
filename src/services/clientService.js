import { supabase } from "./supabaseClient";

export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, vendas(valor)")
      .order("criado_em", { ascending: false });

    if (error) throw error;

    return (data || []).map(cliente => ({
      ...cliente,
      total_devido: cliente.vendas ? cliente.vendas.reduce((sum, v) => sum + (Number(v.valor) || 0), 0) : 0
    }));
  },

  async getById(id) {
    const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(nome, file) {
    let fotoUrl = null;
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
      fotoUrl = publicUrlData.publicUrl;
    }

    const { data, error: dbError } = await supabase
      .from("clientes")
      .insert([{ nome, foto_url: fotoUrl }])
      .select().single();
    
    if (dbError) throw dbError;
    return data;
  },

  async update(id, nome, file) {
    let updates = { nome };
    
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
      updates.foto_url = publicUrlData.publicUrl;
    }

    const { data, error: dbError } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", id)
      .select().single();
    
    if (dbError) throw dbError;
    return data;
  },

  async delete(id) {
    console.log("⚙️ [Service] Deletando vendas do cliente", id);
    const { error: erroVendas } = await supabase.from("vendas").delete().eq("cliente_id", id);
    if (erroVendas) {
      console.error("❌ [Service] Erro ao deletar vendas:", erroVendas);
      throw erroVendas;
    }
    
    console.log("⚙️ [Service] Deletando o cliente", id);
    const { error: erroCliente } = await supabase.from("clientes").delete().eq("id", id);
    if (erroCliente) {
      console.error("❌ [Service] Erro ao deletar cliente:", erroCliente);
      throw erroCliente;
    }
    console.log("✅ [Service] Cliente deletado com sucesso do banco.");
  }
};