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

      if (iaResponse.ok) {
        const iaData = await iaResponse.json();
        resumoIA = iaData.msg || "";
        valorIA = iaData.valor || 0;
      } else {
        const erroTexto = await iaResponse.text();
        console.error("❌ ERRO RETORNADO PELA ROTA DE IA:", erroTexto);
        // O Erro vai forçar a renderização do AudioCard!
        resumoIA = "⚠️ Erro na IA: Verifique o Console (F12)"; 
        valorIA = 0;
      }
    } catch (erro) {
      console.error("❌ FALHA DE REDE AO CONTATAR A IA:", erro);
      resumoIA = "⚠️ Servidor da IA Inacessível";
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