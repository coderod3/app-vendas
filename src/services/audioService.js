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
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, blob);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
    const audioUrl = publicUrlData.publicUrl;

    let resumoIA = "";
    let valorIA = 0;

    try {
      const iaResponse = await fetch("/api/processar-venda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl })
      });

      const data = await iaResponse.json();

      if (!iaResponse.ok) {
        // AQUI VAI APARECER O ERRO REAL
        console.error("❌ ERRO DO SERVIDOR DETALHADO:", data.error);
        throw new Error(data.error || "Erro desconhecido na API");
      }
      
      resumoIA = data.msg;
      valorIA = data.valor;
    } catch (erro) {
      const erroTexto = await iaResponse.text();
      console.error("❌ ERRO IA:", iaResponse.status, erroTexto);
      resumoIA = `⚠️ Erro IA (${iaResponse.status}): ${erroTexto.substring(0,100)}`;

      valorIA = 0;
    }

    const { error: dbError } = await supabase.from("vendas").insert([{ 
      cliente_id: clienteId, 
      audio_url: audioUrl,
      resumo: resumoIA,
      valor: valorIA
    }]);

    if (dbError) throw dbError;
  }
};