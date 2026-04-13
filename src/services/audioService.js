import { supabase } from "./supabaseClient";

export const audioService = {
  async getByClienteId(clienteId) {
    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async uploadAndSave(clienteId, blob) {
    const fileName = `audios/${clienteId}-${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("midias")
      .upload(fileName, blob);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("midias")
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from("vendas")
      .insert([{ 
        cliente_id: clienteId, 
        audio_url: publicUrlData.publicUrl 
      }]);
    if (dbError) throw dbError;
  }
};