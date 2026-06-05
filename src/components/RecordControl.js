export default function RecordControl({ estaGravando, processandoAudio, iniciarGravacao, pararGravacao }) {
  return (
    <div className="record-fab">
      <button 
        onPointerDown={iniciarGravacao}
        onPointerUp={pararGravacao}
        onPointerLeave={pararGravacao}
        disabled={processandoAudio}
        className={`record-btn ${estaGravando ? 'recording' : ''}`}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4a5 5 0 015 5v8a5 5 0 01-10 0V9a5 5 0 015-5z" fill="white"/>
          <path d="M6 15a10 10 0 0020 0M16 25v3" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div className="record-label">{estaGravando ? "Gravando..." : "Segure para gravar"}</div>

      <style jsx>{`
        .record-fab {
          position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 10;
        }
        .record-btn {
          width: 76px; height: 76px; background: linear-gradient(135deg, var(--red), #FF6B6B);
          border: none; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; cursor: pointer; box-shadow: 0 6px 28px rgba(239,68,68,0.45);
          transition: all 0.15s; position: relative;
        }
        .record-btn.recording { transform: scale(1.1); background: var(--red-dark); }
        .record-btn.recording::before {
          content: ''; position: absolute; inset: -6px; border-radius: 50%;
          border: 2.5px solid rgba(239,68,68,0.3); animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          70% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .record-label {
          font-size: 11px; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; background: var(--surface);
          padding: 3px 10px; border-radius: 8px; border: 1.5px solid var(--border);
        }
      `}</style>
    </div>
  );
}