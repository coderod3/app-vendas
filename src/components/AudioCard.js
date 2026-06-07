import { useState, useRef } from "react";
import { audioService } from "@/services/audioService";

export default function AudioCard({ audio, index, onRefresh }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const audioRef = useRef(null);

  const dataFormatada = new Date(audio.criado_em).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  const bars = [4, 8, 14, 20, 26, 20, 14, 8, 4, 6, 12, 18, 24, 18, 12, 6, 4, 8, 14, 20, 14, 8];

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await audioService.processarIAEAtualizar(audio.id, audio.audio_url);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRetrying(false);
    }
  };

  const isProcessando = audio.resumo === "PROCESSANDO";
  const isErro = audio.resumo === "ERRO_IA";

  return (
    <div className={`audio-card ${isPlaying ? 'playing' : ''}`}>
      <div className="audio-number">N {index + 1}</div>
      
      <button className={`play-btn ${isPlaying ? 'playing-btn' : ''}`} onClick={togglePlay}>
        {isPlaying ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="5" y="4" width="4" height="14" rx="2" fill="white"/>
            <rect x="13" y="4" width="4" height="14" rx="2" fill="white"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M7 5l12 6-12 6V5z" fill="white"/>
          </svg>
        )}
      </button>

      <div className="audio-info">
        <div className="audio-waveform">
          {bars.map((h, i) => (
            <div key={i} className="wf-bar" style={{ height: `${h}px` }}></div>
          ))}
        </div>
        <div className="audio-footer">
          <svg className="audio-date-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M7 4v3l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="audio-date">{dataFormatada}</span>
        </div>

        {isProcessando && (
          <div className="audio-ai-box processing">
            <span className="ai-text">Analisando audio...</span>
          </div>
        )}

        {isErro && (
          <div className="audio-ai-box error">
            <span className="ai-text">Falha na analise.</span>
            <button className="retry-btn" onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? "Tentando..." : "Tentar Novamente"}
            </button>
          </div>
        )}

        {!isProcessando && !isErro && audio.resumo && (
          <div className="audio-ai-box success">
            <span className="ai-text">{audio.resumo}</span>
            {Number(audio.valor) > 0 && (
              <span className="ai-value">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(audio.valor)}
              </span>
            )}
          </div>
        )}

      </div>

      <audio 
        ref={audioRef} 
        src={audio.audio_url} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />

      <style jsx>{`
        .audio-card { background: var(--surface); border-radius: 20px; padding: 14px 16px; border: 1.5px solid var(--border); display: flex; align-items: flex-start; gap: 14px; position: relative; transition: all 0.2s; margin-bottom: 10px; }
        .audio-card.playing { border-color: var(--green); background: #F0FFF6; }
        .play-btn { width: 52px; height: 52px; border-radius: 50%; background: var(--green); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 14px rgba(29,185,84,0.35); transition: all 0.2s; margin-top: 4px; }
        .play-btn.playing-btn { background: var(--orange); box-shadow: 0 4px 14px rgba(255,107,53,0.35); }
        .audio-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .audio-waveform { display: flex; align-items: center; gap: 2px; height: 28px; margin-bottom: 6px; }
        .wf-bar { width: 3px; border-radius: 2px; background: var(--border); transition: background 0.1s; }
        .audio-card.playing .wf-bar { background: var(--green); }
        .audio-footer { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
        .audio-date { font-size: 12px; font-weight: 600; }
        .audio-number { position: absolute; top: -8px; left: 12px; background: var(--purple); color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 8px; }
        
        .audio-ai-box { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); gap: 8px; }
        .processing .ai-text { color: var(--text-muted); font-style: italic; }
        .error { flex-direction: column; align-items: flex-start; }
        .error .ai-text { color: #DC2626; font-weight: 600; }
        .retry-btn { margin-top: 6px; background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .retry-btn:active { background: #FEE2E2; }
        .retry-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-text { font-size: 13px; color: var(--text); font-style: italic; line-height: 1.3; }
        .ai-value { background: #D1FAE5; color: #065F46; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 13px; white-space: nowrap; }
      `}</style>
    </div>
  );
}