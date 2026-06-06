"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useClientDetails } from "@/hooks/useClientDetails";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import RecordControl from "@/components/RecordControl";
import AudioCard from "@/components/AudioCard"; // Nosso novo componente

export default function ClientePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clienteId = resolvedParams.id;

  const { cliente, audios, carregando, recarregarDados } = useClientDetails(clienteId);

  const { estaGravando, processandoAudio, iniciarGravacao, pararGravacao } = useAudioRecorder(clienteId, recarregarDados);

  if (carregando) {
    return (
      <div className="phone-wrap flex items-center justify-center bg-[#F8F4FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!cliente) return null;

  // Lógicas de UI
    const iniciais = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";
    const ultimaGravacao = audios.length > 0 
      ? new Date(audios[0].criado_em).toLocaleDateString('pt-BR') 
      : "Nenhuma";
      
    // NOVO: Cálculo Financeiro Instantâneo
    const totalDevido = audios.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  
  return (
    <div className="phone-wrap">
      
      {/* HEADER ROXO */}
      <header className="header">
        <button className="header-back" onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="header-contact-info">
          <div className="header-avatar">
            {cliente.foto_url ? <img src={cliente.foto_url} alt="Cliente" /> : iniciais}
          </div>
          <div>
            <div className="header-contact-name">{cliente.nome || "Registro Antigo"}</div>
            <div className="header-contact-sub">{audios.length} gravações</div>
          </div>
        </div>
      </header>

      {/* ESTATÍSTICAS */}
      {/* ESTATÍSTICAS */}
      <div className="audio-header-ext">
        <div className="stat-pill">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a3 3 0 013 3v3a3 3 0 01-6 0V4a3 3 0 013-3z" fill="white"/><path d="M2 6a5 5 0 0010 0M7 11v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span>{audios.length}</span>
        </div>
        
        {/* NOVA PILL DE DINHEIRO */}
        <div className="stat-pill highlight-money">
          💰 {formatadorMoeda.format(totalDevido)}
        </div>
      </div>

      {/* LISTA DE ÁUDIOS */}
      <div className="scroll-area">
        <div className="audio-list">
          {audios.length === 0 ? (
            <div className="flex flex-col items-center mt-10 opacity-50">
               <div className="text-4xl mb-2">🎤</div>
               <p className="text-gray-500 font-bold">Nenhum áudio gravado.</p>
            </div>
          ) : (
            audios.map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))
          )}
        </div>
      </div>

      {/* COMPONENTE DO GRAVADOR */}
      <RecordControl 
        estaGravando={estaGravando}
        processandoAudio={processandoAudio}
        iniciarGravacao={iniciarGravacao}
        pararGravacao={pararGravacao}
      />

      <style jsx>{`
        .header { height: 64px; background: var(--purple); display: flex; align-items: center; padding: 0 16px; gap: 12px; flex-shrink: 0; position: relative; z-index: 2; }
        .header-back { width: 44px; height: 44px; background: rgba(255,255,255,0.15); border: none; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
        .header-back:active { background: rgba(255,255,255,0.3); transform: scale(0.95); }
        .header-contact-info { flex: 1; display: flex; align-items: center; gap: 12px; }
        .header-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--orange); border: 2px solid rgba(255,255,255,0.4); font-size: 16px; font-weight: 800; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .header-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .header-contact-name { font-size: 17px; font-weight: 800; color: white; line-height: 1.2; }
        .header-contact-sub { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600; }
        
        .audio-header-ext { background: var(--purple); padding: 4px 16px 14px; display: flex; align-items: center; gap: 10px; }
        .stat-pill { background: rgba(255,255,255,0.18); border-radius: 12px; padding: 6px 14px; font-size: 13px; font-weight: 700; color: white; display: flex; align-items: center; gap: 6px; }
        
        .audio-list { padding: 12px 16px 120px; display: flex; flex-direction: column; }
        .highlight-money { background: #1DB954; color: white; font-size: 14px; }
      `}</style>
    </div>
  );
}