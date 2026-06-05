export default function Drawer({ isOpen, onClose }) {
  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-app-logo">Venda<span>Fácil</span></div>
          <div className="drawer-subtitle">Controle de vendas por voz</div>
        </div>
        <div className="drawer-menu">
          <div className="drawer-item active">
            <div className="drawer-icon" style={{background:'rgba(108,60,225,0.3)'}}>👤</div>
            <div>
              <div className="drawer-item-label">Clientes</div>
              <div className="drawer-item-sub">Todos os contatos</div>
            </div>
          </div>
          <div className="drawer-item" onClick={() => alert('Em breve!')}>
            <div className="drawer-icon" style={{background:'rgba(255,107,53,0.2)'}}>📜</div>
            <div>
              <div className="drawer-item-label">Histórico</div>
              <div className="drawer-item-sub">Todas as gravações</div>
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <div className="drawer-version">VendaFácil v1.0</div>
        </div>
      </div>
      <style jsx>{`
        .drawer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); z-index: 50; pointer-events: none; transition: background 0.3s; }
        .drawer-overlay.open { background: rgba(0,0,0,0.5); pointer-events: all; }
        .drawer { position: absolute; top: 0; left: 0; bottom: 0; width: 78%; max-width: 300px; background: #1A0E40; transform: translateX(-100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); z-index: 51; display: flex; flex-direction: column; border-radius: 0 28px 28px 0; overflow: hidden; }
        .drawer.open { transform: translateX(0); }
        .drawer-header { padding: 50px 24px 24px; background: var(--purple); }
        .drawer-app-logo { font-size: 26px; font-weight: 900; color: white; }
        .drawer-app-logo span { color: #FFD166; }
        .drawer-subtitle { font-size: 13px; color: rgba(255,255,255,0.6); }
        .drawer-menu { padding: 16px 12px; flex: 1; }
        .drawer-item { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 16px; cursor: pointer; margin-bottom: 4px; }
        .drawer-item.active { background: rgba(255,255,255,0.1); }
        .drawer-item-label { font-size: 15px; font-weight: 700; color: white; }
        .drawer-item-sub { font-size: 12px; color: rgba(255,255,255,0.45); }
        .drawer-footer { padding: 16px 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); }
        .drawer-version { font-size: 12px; color: rgba(255,255,255,0.3); }
      `}</style>
    </>
  );
}