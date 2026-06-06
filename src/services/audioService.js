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
    
    // Upload do áudio
    const { error: uploadError } = await supabase.storage.from("midias").upload(fileName, blob);
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("midias").getPublicUrl(fileName);
    const audioUrl = publicUrlData.publicUrl;

    let resumoIA = "Erro ao processar com IA";
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
        data = { error: "Resposta inválida do servidor" };
      }

      if (!iaResponse.ok) {
        console.error("❌ ERRO DO SERVIDOR DETALHADO:", data.error || data);
        resumoIA = data.error || "Erro na API de IA";
        throw new Error(resumoIA);
      }
      
      resumoIA = data.msg || "Venda registrada";
      valorIA = data.valor || 0;

    } catch (erro) {
      console.error("❌ ERRO NO PROCESSAMENTO IA:", erro);
      // Não tenta usar iaResponse aqui
      resumoIA = `⚠️ Falha na IA: ${erro.message || "Erro desconhecido"}`;
      valorIA = 0;
    }

    // Sempre tenta salvar no banco
    const { error: dbError } = await supabase.from("vendas").insert([{ 
      cliente_id: clienteId, 
      audio_url: audioUrl,
      resumo: resumoIA,
      valor: valorIA
    }]);

    if (dbError) {
      console.error("Erro ao salvar no banco:", dbError);
      throw dbError;
    }

    console.log("✅ Venda salva com sucesso:", { resumoIA, valorIA });
  }
}