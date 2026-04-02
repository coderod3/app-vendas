"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function ClientePage({ params }) {
  const router = useRouter();
  // No Next.js 15+, params é uma Promise, então precisamos usar o hook 'use' do React
  const resolvedParams = use(params);
  const clienteId = resolvedParams.id;

  // Estados do Banco de Dados
  const [cliente, setCliente] = useState(null);
  const [audios, setAudios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Gravador
  const [estaGravando, setEstaGravando] = useState(false);
  const [processandoAudio, setProcessandoAudio] = useState(false);
  
  // Referências para a MediaRecorder API (Não causam re-render na tela)
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // 1. Busca os dados do cliente (para mostrar a foto no topo)
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single();

      if (clienteError) throw clienteError;
      setCliente(clienteData);

      // 2. Busca o histórico de áudios (vendas) desse cliente
      const { data: audiosData, error: audiosError } = await supabase
        .from("vendas")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });

      if (audiosError) throw audiosError;
      setAudios(audiosData || []);

    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      alert("Erro ao carregar o perfil do cliente.");
    } finally {
      setCarregando(false);
    }
  };

  // --- LÓGICA CORE DE GRAVAÇÃO ---

  const iniciarGravacao = async () => {
    try {
      // Pede permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Conforme o áudio é capturado, guarda os pedaços na memória
      mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) {
          chunksRef.current.push(evento.data);
        }
      };

      // Quando a gravação parar, junta tudo e faz o upload
      mediaRecorder.onstop = async () => {
        setProcessandoAudio(true);
        // Libera o microfone (boa prática de engenharia)
        stream.getTracks().forEach(track => track.stop());

        const blobDoAudio = new Blob(chunksRef.current, { type: "audio/webm" });
        await salvarAudioNoBanco(blobDoAudio);
      };

      // Inicia de fato
      mediaRecorder.start();
      setEstaGravando(true);

      // Feedback tátil: 1 vibração curta para indicar "Início"
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

    } catch (erro) {
      console.error("Erro ao acessar microfone:", erro);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && estaGravando) {
      mediaRecorderRef.current.stop();
      setEstaGravando(false);

      // Feedback tátil: 2 vibrações para indicar "Fim"
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
    }
  };

  const salvarAudioNoBanco = async (blob) => {
    try {
      const nomeArquivo = `audios/${clienteId}-${Date.now()}.webm`;

      // 1. Upload pro Storage (usando o mesmo bucket 'midias' que já liberamos)
      const { error: uploadError } = await supabase.storage
        .from("midias")
        .upload(nomeArquivo, blob);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("midias")
        .getPublicUrl(nomeArquivo);

      // 2. Salva o registro na tabela de Vendas
      const { error: dbError } = await supabase
        .from("vendas")
        .insert([
          { 
            cliente_id: clienteId, 
            audio_url: publicUrlData.publicUrl 
          }
        ]);

      if (dbError) throw dbError;

      // Atualiza a lista na tela
      await carregarDados();

    } catch (erro) {
      console.error("Erro ao salvar áudio:", erro);
      alert("Falha ao salvar a gravação.");
    } finally {
      setProcessandoAudio(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pb-32">
      
      {/* Header Fixo de Voltar */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={() => router.push('/')}
          className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl active:bg-gray-200"
        >
          ⬅️
        </button>
        <img 
          src={cliente.foto_url} 
          alt="Cliente" 
          className="w-16 h-16 rounded-full object-cover border border-gray-200"
        />
      </header>

      {/* Lista de Áudios (Vendas) */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {audios.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Nenhum áudio gravado ainda.</p>
        )}

        {audios.map((audio) => (
          <div key={audio.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-4xl">▶️</div>
            <audio src={audio.audio_url} controls className="w-full h-10" />
          </div>
        ))}
      </div>

      {/* Área do Gravador Fixa no Rodapé */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center border-t border-gray-200">
        
        {processandoAudio && (
          <p className="text-green-600 font-bold mb-2 animate-pulse">Salvando na nuvem...</p>
        )}

        <button
          onPointerDown={iniciarGravacao}
          onPointerUp={pararGravacao}
          onPointerLeave={pararGravacao} // Garante que pare se ela arrastar o dedo para fora do botão
          disabled={processandoAudio}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl transition-all ${
            estaGravando 
              ? "bg-red-500 scale-110 animate-pulse ring-4 ring-red-200" 
              : "bg-green-500 active:scale-95"
          }`}
        >
          {estaGravando ? "⏹️" : "🎤"}
        </button>
        <p className="text-gray-400 text-sm mt-3 font-medium">
          {estaGravando ? "Solte para salvar" : "Segure para gravar"}
        </p>
      </div>

    </main>
  );
}