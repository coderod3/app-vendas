"use client";

import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import ClientCard from "@/components/ClientCard";
import Drawer from "@/components/Drawer";

export default function Home() {
  const { clientes, carregandoLista, salvandoFoto, adicionarCliente } = useClients();
  const [modoVisualizacao, setModoVisualizacao] = useState("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  // CORREÇÃO: Lógica de busca robusta que não quebra com clientes antigos (sem nome)
  const clientesFiltrados = clientes.filter(c => {
    const nomeSeguro = c.nome || "Registro Antigo";
    return nomeSeguro.toLowerCase().includes(termoBusca.toLowerCase());
  });

  const handleSubmitNovoCliente = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const arquivo = e.target.foto.files[0];
    
    if (!nome || !arquivo) return alert("Por favor, preencha o nome e selecione uma foto!");
    
    const res = await adicionarCliente(nome, arquivo);
    if (res.success) {
      setIsModalOpen(false);
      e.target.reset(); // Limpa o formulário
    }
  };

  return (
    <div className="phone-wrap">
      {/* CORREÇÃO: Drawer só existe no HTML se isDrawerOpen for true (evita o "flash") */}
      {isDrawerOpen && <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />}

      <header className="header">
        <button className="icon-btn" onClick={() => setIsDrawerOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="2.5" rx="1.25" fill="white"/>
            <rect x="2" y="9" width="12" height="2.5" rx="1.25" fill="white"/>
            <rect x="2" y="14" width="16" height="2.5" rx="1.25" fill="white"/>
          </svg>
        </button>
        <div className="header-logo">Venda<span>Fácil</span></div>
        <button className="icon-btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M3 10h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <div className="search-wrap">
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
            <path d="M11.5 11.5L15 15" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${modoVisualizacao === 'list' ? 'active' : ''}`}
          onClick={() => setModoVisualizacao('list')}
        >
          Lista
        </button>
        <button 
          className={`toggle-btn ${modoVisualizacao === 'grid' ? 'active' : ''}`}
          onClick={() => setModoVisualizacao('grid')}
        >
          Grade
        </button>
        <span className="section-label">{clientesFiltrados.length} clientes</span>
      </div>

      <div className="scroll-area">
        {carregandoLista ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
             <p>Buscando clientes...</p>
          </div>
        ) : (
          <div className={modoVisualizacao === 'list' ? "contact-list" : "contact-grid"}>
            {clientesFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              clientesFiltrados.map(cliente => (
                <ClientCard 
                  key={cliente.id} 
                  cliente={cliente} 
                  modoVisualizacao={modoVisualizacao} 
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* CORREÇÃO: Modal com renderização condicional para evitar o "flash" inicial */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <form className="modal-sheet" onClick={e => e.stopPropagation()} onSubmit={handleSubmitNovoCliente}>
            <div className="modal-handle"></div>
            <div className="modal-title">Novo Cliente</div>
            
            <input type="file" id="foto" name="foto" accept="image/*" className="hidden" required />
            <label htmlFor="foto" className="photo-picker">
              <span>📸</span>
              <div className="photo-badge">+</div>
            </label>

            <div className="input-group">
              <input type="text" name="nome" placeholder="Nome do cliente" required autoFocus />
            </div>

            <button type="submit" className="btn-primary" disabled={salvandoFoto}>
              {salvandoFoto ? "Salvando..." : "Salvar Cliente"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .header { height: 64px; background: var(--purple); display: flex; align-items: center; padding: 0 16px; gap: 12px; color: white; flex-shrink: 0; }
        .header-logo { font-size: 22px; font-weight: 900; flex: 1; letter-spacing: -0.5px; }
        .header-logo span { color: #FFD166; }
        .icon-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.15); border: none; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
        .icon-btn:active { background: rgba(255,255,255,0.3); }
        
        .search-wrap { padding: 14px 16px 10px; background: var(--purple); flex-shrink: 0; }
        .search-bar { background: rgba(255,255,255,0.18); border-radius: 16px; display: flex; align-items: center; padding: 0 14px; gap: 10px; height: 48px; border: 1.5px solid rgba(255,255,255,0.2); }
        .search-bar input { flex: 1; background: none; border: none; outline: none; color: white; font-size: 15px; font-weight: 600; }
        .search-bar input::placeholder { color: rgba(255,255,255,0.55); }

        .view-toggle { display: flex; gap: 6px; padding: 12px 16px 8px; background: var(--surface); border-bottom: 1.5px solid var(--border); flex-shrink: 0; align-items: center; }
        .toggle-btn { padding: 8px 16px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .toggle-btn.active { background: var(--purple); color: white; shadow: 0 4px 12px rgba(108,60,225,0.2); }
        .toggle-btn:not(.active) { background: var(--surface2); color: var(--text-muted); }
        
        .section-label { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .contact-list { padding: 8px 0 100px; display: flex; flex-direction: column; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 16px 100px; }

        .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 60; display: flex; align-items: flex-end; transition: opacity 0.3s; }
        .modal-sheet { background: var(--surface); border-radius: 28px 28px 0 0; padding: 0 20px 40px; width: 100%; transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 14px auto 22px; }
        .modal-title { font-size: 20px; font-weight: 900; color: var(--text); text-align: center; margin-bottom: 24px; }
        
        .photo-picker { width: 96px; height: 96px; border-radius: 50%; background: var(--surface2); border: 3px dashed var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; cursor: pointer; position: relative; font-size: 30px; }
        .photo-badge { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; background: var(--orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface); color: white; font-size: 20px; }
        
        .input-group { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 18px; display: flex; align-items: center; padding: 4px 16px; margin-bottom: 12px; }
        .input-group input { flex: 1; border: none; background: none; font-size: 16px; font-weight: 600; color: var(--text); padding: 12px 0; outline: none; }
        
        .btn-primary { width: 100%; padding: 17px; background: var(--purple); color: white; border: none; border-radius: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
        .btn-primary:active { background: var(--purple-dark); transform: scale(0.98); }
        .btn-secondary { width: 100%; padding: 15px; background: transparent; color: var(--text-muted); border: none; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; gap: 16px; }
        .empty-icon { font-size: 50px; opacity: 0.5; }
        .empty-text { font-size: 16px; font-weight: 700; color: var(--text-muted); }
      `}</style>
    </div>
  );
}