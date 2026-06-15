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

  async uploadAndSaveInicial(clienteId, blob) {
    const fileName = `audios/${clienteId}-${Date.now()}.webm`;
    
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, blob);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
    const audioUrl = publicUrlData.publicUrl;

    const { data, error: dbError } = await supabase.from("vendas").insert([{ 
      cliente_id: clienteId, 
      audio_url: audioUrl,
      resumo: "PROCESSANDO",
      valor: 0
    }]).select();

    if (dbError) throw dbError;
    return data[0]; 
  },

  async processarIAEAtualizar(vendaId, audioUrl) {
    let resumoIA = "ERRO_IA";
    let valorIA = 0;

    try {
      const iaResponse = await fetch("/api/processar-venda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl })
      });

      let data;
      try {
        data = await iaResponse.json();
      } catch (e) {
        data = { error: "Resposta invalida do servidor" };
      }

      if (iaResponse.ok) {
        resumoIA = data.msg || "Venda registrada";
        valorIA = data.valor || 0;
      } else {
        console.error("Erro na API de IA:", data.error || data);
      }
    } catch (erro) {
      console.error("Erro no processamento IA:", erro);
    }

    const { error: updateError } = await supabase.from("vendas").update({
      resumo: resumoIA,
      valor: valorIA
    }).eq("id", vendaId);

    if (updateError) {
      console.error("Erro ao atualizar banco:", updateError);
      throw updateError;
    }
  },

  async delete(id) {
    const { error } = await supabase.from("vendas").delete().eq("id", id);
    if (error) throw error;
  }
};