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
    // 1. Faz o Upload do Áudio para o Storage
    const fileName = `audios/${clienteId}-${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, blob);
    if (uploadError) throw uploadError;

    // 2. Pega a URL pública do áudio
    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
    const audioUrl = publicUrlData.publicUrl;

    // 3. Chama a nossa API de IA
    let resumoIA = "";
    let valorIA = 0;

    try {
      const iaResponse = await fetch("/api/processar-venda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl })
      });

      if (iaResponse.ok) {
        const iaData = await iaResponse.json();
        resumoIA = iaData.msg || "";
        valorIA = iaData.valor || 0;
      } else {
        console.error("Erro na API da IA:", await iaResponse.text());
      }
    } catch (erro) {
      console.error("Falha ao comunicar com a rota de IA:", erro);
    }

    // 4. Salva no banco de dados (Áudio + Dados da IA)
    const { error: dbError } = await supabase.from("vendas").insert([{ 
      cliente_id: clienteId, 
      audio_url: audioUrl,
      resumo: resumoIA,
      valor: valorIA
    }]);

    if (dbError) throw dbError;
  }
};