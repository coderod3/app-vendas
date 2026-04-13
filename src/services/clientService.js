import { supabase } from "./supabaseClient";

export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return data || [];
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

  async create(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("midias")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("midias")
      .getPublicUrl(fileName);

    const { data, error: dbError } = await supabase
      .from("clientes")
      .insert([{ foto_url: publicUrlData.publicUrl }])
      .select()
      .single();
    if (dbError) throw dbError;
    return data;
  }
};