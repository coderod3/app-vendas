"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useClientDetails } from "@/hooks/useClientDetails";
import { useAudioRecorder } from "@/hooks/useAudioRecorder"; // O Hook de microfone que criamos antes
import RecordControl from "@/components/RecordControl";

export default function ClientePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clienteId = resolvedParams.id;

  // 1. Hook para gerenciar os dados (Banco de Dados)
  const { cliente, audios, carregando, recarregarDados } = useClientDetails(clienteId);

  // 2. Hook para gerenciar o gravador (Microfone e Upload)
  // Passamos o 'recarregarDados' para ele atualizar a lista assim que o upload terminar
  const { 
    estaGravando, 
    processandoAudio, 
    iniciarGravacao, 
    pararGravacao 
  } = useAudioRecorder(clienteId, recarregarDados);


  // --- RENDERIZAÇÃO DA INTERFACE ---

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
      
      {/* Header */}
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

      {/* Lista de Áudios */}
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

      {/* Componente Isolado do Gravador */}
      <RecordControl 
        estaGravando={estaGravando}
        processandoAudio={processandoAudio}
        iniciarGravacao={iniciarGravacao}
        pararGravacao={pararGravacao}
      />

    </main>
  );
}