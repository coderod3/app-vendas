"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useClientDetails } from "@/hooks/useClientDetails";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import RecordControl from "@/components/RecordControl";
import AudioCard from "@/components/AudioCard";
import { audioService } from "@/services/audioService";
import { useToast } from "@/contexts/ToastContext";

export default function ClientePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clienteId = resolvedParams.id;
  const { showToast } = useToast();

  const { cliente, audios, carregando, recarregarDados } = useClientDetails(clienteId);
  const { estaGravando, processandoAudio, iniciarGravacao, pararGravacao } = useAudioRecorder(clienteId, recarregarDados);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [audioDeletando, setAudioDeletando] = useState(null);
  const [diasExpandidos, setDiasExpandidos] = useState({});

  // === LÓGICA DE AGRUPAMENTO DE ÁUDIOS POR DIA ===
  const gruposAudios = useMemo(() => {
    const grupos = {};
    audios.forEach((audio, index) => {
      const dataLocal = new Date(audio.criado_em);
      dataLocal.setHours(0, 0, 0, 0); // Zera a hora para agrupar apenas pelo dia
      const dataRef = dataLocal.getTime();

      if (!grupos[dataRef]) {
        grupos[dataRef] = { date: dataLocal, items: [] };
      }
      // Salvamos o index original para manter a numeração sequencial correta (Nº 1, Nº 2...)
      grupos[dataRef].items.push({ ...audio, originalIndex: index });
    });

    return Object.values(grupos).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [audios]);

  const formatarDataCabecalho = (data) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diffTime = hoje.getTime() - data.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays === 2) return "Anteontem";
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const toggleDia = (dataRef) => {
    setDiasExpandidos(prev => ({
      ...prev,
      [dataRef]: prev[dataRef] === false ? true : false // Inverte o estado (Padrão é aberto)
    }));
  };

  if (carregando) {
    return (
      <div className="phone-wrap flex items-center justify-center bg-[#F8F4FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!cliente) return null;

  const iniciais = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const totalGlobal = audios.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalSelecionado = audios
    .filter(a => selectedAudios.includes(a.id))
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const toggleSelection = (id) => {
    if (selectedAudios.includes(id)) {
      setSelectedAudios(selectedAudios.filter(item => item !== id));
    } else {
      setSelectedAudios([...selectedAudios, id]);
    }
  };

  const handleExcluirAudios = async () => {
    try {
      showToast("Excluindo...");
      
      if (audioDeletando === 'multiple') {
        for (let id of selectedAudios) {
          await audioService.delete(id);
        }
      } else if (audioDeletando && audioDeletando.id) {
        await audioService.delete(audioDeletando.id);
      }
      
      showToast("Excluido com sucesso.");
      setAudioDeletando(null);
      setIsSelectionMode(false);
      setSelectedAudios([]);
      recarregarDados();
    } catch (e) {
      console.error(e);
      showToast("Falha ao excluir.");
    }
  };

  return (
    <div className="phone-wrap">
      
      {!isSelectionMode ? (
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
              <div className="header-contact-sub">{audios.length} gravacoes</div>
            </div>
          </div>
          <button className="icon-btn-header" onClick={() => setIsSelectionMode(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
          </button>
        </header>
      ) : (
        <header className="header selection-header">
          <button className="header-back" onClick={() => { setIsSelectionMode(false); setSelectedAudios([]); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="header-contact-info">
            <div className="header-contact-name">{selectedAudios.length} selecionados</div>
          </div>
          <div className="selection-actions">
            <div className="stat-pill highlight-money">
              R$ {formatadorMoeda.format(totalSelecionado).replace('R$', '').trim()}
            </div>
            {selectedAudios.length > 0 && (
              <button className="icon-btn-header trash-btn" onClick={() => setAudioDeletando('multiple')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        </header>
      )}

      {!isSelectionMode && (
        <div className="audio-header-ext">
          <div className="stat-pill">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a3 3 0 013 3v3a3 3 0 01-6 0V4a3 3 0 013-3z" fill="white"/><path d="M2 6a5 5 0 0010 0M7 11v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span>{audios.length}</span>
          </div>
          <div className="stat-pill highlight-money">
            R$ {formatadorMoeda.format(totalGlobal).replace('R$', '').trim()}
          </div>
        </div>
      )}

      <div className="scroll-area">
        <div className="audio-list">
          {audios.length === 0 ? (
            <div className="flex flex-col items-center mt-10 opacity-50">
               <p className="text-gray-500 font-bold">Nenhum audio gravado.</p>
            </div>
          ) : (
            gruposAudios.map(grupo => {
              const dataRef = grupo.date.getTime();
              const isExpanded = diasExpandidos[dataRef] !== false; 

              return (
                <div key={dataRef} className="audio-group">
                  <div className="group-header" onClick={() => toggleDia(dataRef)}>
                    <span className="group-date">{formatarDataCabecalho(grupo.date)}</span>
                    <button type="button" className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="group-items">
                      {grupo.items.map(item => (
                        <AudioCard 
                          key={item.id} 
                          audio={item} 
                          index={item.originalIndex} 
                          onRefresh={recarregarDados}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedAudios.includes(item.id)}
                          onToggleSelect={toggleSelection}
                          onDelete={(audioObj) => setAudioDeletando(audioObj)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!isSelectionMode && (
        <RecordControl 
          estaGravando={estaGravando}
          processandoAudio={processandoAudio}
          iniciarGravacao={iniciarGravacao}
          pararGravacao={pararGravacao}
        />
      )}

      {audioDeletando && (
        <div className="modal-overlay open" onClick={() => setAudioDeletando(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ marginTop: '20px', color: '#DC2626' }}>Atencao</div>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
              Tem certeza que deseja apagar {audioDeletando === 'multiple' ? `estes ${selectedAudios.length} audios` : 'este audio'}?
            </p>
            <button type="button" className="btn-primary" style={{ background: '#DC2626' }} onClick={handleExcluirAudios}>
              Sim, Excluir
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAudioDeletando(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .header { height: 64px; background: var(--purple); display: flex; align-items: center; padding: 0 16px; gap: 12px; flex-shrink: 0; position: relative; z-index: 2; transition: background 0.3s; }
        .selection-header { background: #1E1E2C; }
        
        .header-back { width: 44px; height: 44px; background: rgba(255,255,255,0.15); border: none; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
        .header-back:active { background: rgba(255,255,255,0.3); transform: scale(0.95); }
        
        .header-contact-info { flex: 1; display: flex; align-items: center; gap: 12px; }
        .header-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--orange); border: 2px solid rgba(255,255,255,0.4); font-size: 16px; font-weight: 800; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .header-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .header-contact-name { font-size: 17px; font-weight: 800; color: white; line-height: 1.2; }
        .header-contact-sub { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600; }
        
        .icon-btn-header { background: rgba(255,255,255,0.15); border: none; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .trash-btn { background: #DC2626; border: 1px solid rgba(255,255,255,0.3); }
        
        .selection-actions { display: flex; align-items: center; gap: 10px; }

        .audio-header-ext { background: var(--purple); padding: 4px 16px 14px; display: flex; align-items: center; gap: 10px; }
        .stat-pill { background: rgba(255,255,255,0.18); border-radius: 12px; padding: 6px 14px; font-size: 13px; font-weight: 700; color: white; display: flex; align-items: center; gap: 6px; }
        
        .audio-list { padding: 12px 16px 120px; display: flex; flex-direction: column; }
        .highlight-money { background: #1DB954; color: white; font-size: 14px; font-weight: 800; }

        .audio-group { margin-bottom: 24px; }
        .group-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: var(--surface2); border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: background 0.2s; border: 1px solid var(--border); }
        .group-header:active { background: var(--border); }
        .group-date { font-size: 12px; font-weight: 800; color: rgba(0,0,0); text-transform: uppercase; letter-spacing: 0.5px; }
        .expand-btn { background: none; border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; padding: 0; }
        .expand-btn.expanded { transform: rotate(90deg); }
        .group-items { display: flex; flex-direction: column; }

        .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 60; display: flex; align-items: flex-end; transition: opacity 0.3s; }
        .modal-sheet { background: var(--surface); border-radius: 28px 28px 0 0; padding: 0 20px 40px; width: 100%; transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .btn-primary { width: 100%; padding: 17px; color: white; border: none; border-radius: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
        .btn-secondary { width: 100%; padding: 15px; background: transparent; color: var(--text-muted); border: none; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; }
      `}</style>
    </div>
  );
}