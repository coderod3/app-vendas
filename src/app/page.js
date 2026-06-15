"use client";

import { useState, useRef } from "react";
import { useClients } from "@/hooks/useClients";
import ClientCard from "@/components/ClientCard";
import Drawer from "@/components/Drawer";
import { useToast } from "@/contexts/ToastContext";

export default function Home() {
  const { clientes, carregandoLista, salvandoFoto, adicionarCliente, editarCliente, deletarCliente } = useClients();
  const [modoVisualizacao, setModoVisualizacao] = useState("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const { showToast } = useToast(); 
  
  // Estados para Gestao de Modais e Edicao
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteDeletando, setClienteDeletando] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const nomeRef = useRef(null);

  const handleFotoChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) setFotoPreview(URL.createObjectURL(arquivo));
  };

  // Funcoes para abrir Modais
  const abrirModalNovo = () => {
    setClienteEditando(null);
    setFotoPreview(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente);
    setFotoPreview(cliente.foto_url || null);
    setIsModalOpen(true);
  };

  const confirmarExclusao = async () => {
    console.log("👉 [Modal] Confirmar exclusão acionado. ID:", clienteDeletando?.id);
    showToast("Excluindo cliente...");
    
    const res = await deletarCliente(clienteDeletando.id);
    console.log("⚙️ [Modal] Resposta da exclusão:", res);
    
    if (res.success) {
      showToast("Cliente excluido com sucesso.");
      setClienteDeletando(null); // Fecha o modal
    } else {
      showToast("Falha ao excluir. Olhe o Console (F12).");
    }
  };

  // Reconhecimento de Voz
  const iniciarReconhecimentoVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Navegador nao suporta audio.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (nomeRef.current) nomeRef.current.value = transcript;
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.start();
  };

  // Submissao (Criação e Edição)
  const handleSubmitFormulario = async (e) => {
    e.preventDefault();
    let nomeFinal = nomeRef.current ? nomeRef.current.value.trim() : "";
    const arquivo = e.target.foto.files[0];
    
    // Nome Dinamico Automatico se estiver vazio
    if (!nomeFinal) {
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, '0');
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const hora = String(agora.getHours()).padStart(2, '0');
      const min = String(agora.getMinutes()).padStart(2, '0');
      nomeFinal = `Cliente ${dia}/${mes} ${hora}:${min}`;
    }
    
    showToast("Guardando..."); 
    let res;

    if (clienteEditando) {
      res = await editarCliente(clienteEditando.id, nomeFinal, arquivo);
    } else {
      res = await adicionarCliente(nomeFinal, arquivo);
    }
    
    if (res.success) {
      setIsModalOpen(false);
      e.target.reset();
      setFotoPreview(null);
      showToast("Salvo com sucesso!"); 
    } else {
      showToast("Falha ao guardar.");
    }
  };

  const totalGlobal = clientes.reduce((acc, curr) => acc + (curr.total_devido || 0), 0);
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const clientesFiltrados = clientes.filter(c => {
    const nomeSeguro = c.nome || "";
    return nomeSeguro.toLowerCase().includes(termoBusca.toLowerCase());
  });

  return (
    <div className="phone-wrap">
      {isDrawerOpen && <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />}

      <header className="header">
        <button className="icon-btn" onClick={() => setIsDrawerOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="2.5" rx="1.25" fill="white"/>
            <rect x="2" y="9" width="12" height="2.5" rx="1.25" fill="white"/>
            <rect x="2" y="14" width="16" height="2.5" rx="1.25" fill="white"/>
          </svg>
        </button>
        
        <div className="header-info">
          <span className="header-label">A Receber</span>
          <span className="header-total">{formatadorMoeda.format(totalGlobal)}</span>
        </div>

        <button className="icon-btn" onClick={abrirModalNovo}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M3 10h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      <div className="search-wrap">
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
            <path d="M11.5 11.5L15 15" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
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
        <button className={`toggle-btn ${modoVisualizacao === 'list' ? 'active' : ''}`} onClick={() => setModoVisualizacao('list')}>Lista</button>
        <button className={`toggle-btn ${modoVisualizacao === 'grid' ? 'active' : ''}`} onClick={() => setModoVisualizacao('grid')}>Grade</button>
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
                <p className="empty-text">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              clientesFiltrados.map(cliente => (
                <ClientCard 
                  key={cliente.id} 
                  cliente={cliente} 
                  modoVisualizacao={modoVisualizacao}
                  onEdit={abrirModalEditar}
                  onDelete={setClienteDeletando}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <form className="modal-sheet" onClick={e => e.stopPropagation()} onSubmit={handleSubmitFormulario}>
            <div className="modal-handle"></div>
            <div className="modal-title">{clienteEditando ? "Editar Cliente" : "Novo Cliente"}</div>
            
            <input 
              type="file" 
              id="foto" 
              name="foto" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFotoChange} 
            />

            <label htmlFor="foto" className="photo-picker">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <span style={{ fontSize: '30px' }}>Foto</span>
              )}
              <div className="photo-badge">+</div>
            </label>

            <div className="input-group">
              <input 
                type="text" 
                name="nome" 
                ref={nomeRef}
                defaultValue={clienteEditando ? clienteEditando.nome : ""} 
                placeholder="Nome (ou deixe vazio para Data)" 
                autoFocus 
              />
              <button 
                type="button" 
                onClick={iniciarReconhecimentoVoz} 
                className={`mic-btn ${isListening ? 'listening' : ''}`}
              >
                {isListening ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--orange)"><circle cx="12" cy="12" r="8"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                )}
              </button>
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

      {/* Modal de Confirmação de Exclusão */}
      {clienteDeletando && (
        <div className="modal-overlay open" onClick={() => setClienteDeletando(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ marginTop: '20px', color: '#DC2626' }}>Atenção</div>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
              Tem certeza que deseja excluir o cliente <b>{clienteDeletando.nome}</b>? Todas as vendas vinculadas a ele poderão ser apagadas.
            </p>
            {/* <button type="button" className="btn-primary" style={{ background: '#DC2626' }} onClick={confirmarExclusao}>
              Sim, Excluir
            </button> */}
            <button 
              type="button" 
              className="btn-primary" 
              style={{ background: '#DC2626' }} 
              onClick={(e) => {
                e.preventDefault();
                confirmarExclusao();
              }}
            >
              Sim, Excluir
            </button>
            <button type="button" className="btn-secondary" onClick={() => setClienteDeletando(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .header { height: 64px; background: var(--purple); display: flex; align-items: center; padding: 0 16px; gap: 12px; color: white; flex-shrink: 0; }
        .header-info { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-left: 4px; }
        .header-label { font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; font-weight: 800; letter-spacing: 1px; line-height: 1; margin-bottom: 2px; }
        .header-total { font-size: 20px; font-weight: 900; color: white; line-height: 1; }

        .icon-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.15); border: none; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
        .icon-btn:active { background: rgba(255,255,255,0.3); }
        
        .search-wrap { padding: 14px 16px 10px; background: var(--purple); flex-shrink: 0; }
        .search-bar { background: rgba(255,255,255,0.18); border-radius: 16px; display: flex; align-items: center; padding: 0 14px; gap: 10px; height: 48px; border: 1.5px solid rgba(255,255,255,0.2); }
        .search-bar input { flex: 1; background: none; border: none; outline: none; color: white; font-size: 15px; font-weight: 600; }
        .search-bar input::placeholder { color: rgba(255,255,255,0.55); }

        .view-toggle { display: flex; gap: 6px; padding: 12px 16px 8px; background: var(--surface); border-bottom: 1.5px solid var(--border); flex-shrink: 0; align-items: center; }
        .toggle-btn { padding: 8px 16px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .toggle-btn.active { background: var(--purple); color: white; box-shadow: 0 4px 12px rgba(108,60,225,0.2); }
        .toggle-btn:not(.active) { background: var(--surface2); color: var(--text-muted); }
        
        .section-label { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .contact-list { padding: 8px 0 100px; display: flex; flex-direction: column; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 16px 100px; }

        .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 60; display: flex; align-items: flex-end; transition: opacity 0.3s; }
        .modal-sheet { background: var(--surface); border-radius: 28px 28px 0 0; padding: 0 20px 40px; width: 100%; transform: translateY(0); animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 14px auto 22px; }
        .modal-title { font-size: 20px; font-weight: 900; color: var(--text); text-align: center; margin-bottom: 24px; }
        
        .photo-picker { width: 96px; height: 96px; border-radius: 50%; background: var(--surface2); border: 3px dashed var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; cursor: pointer; position: relative; overflow: visible; }
        .photo-preview { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .photo-badge { position: absolute; bottom: 0px; right: 0px; width: 30px; height: 30px; background: var(--orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--surface); color: white; font-size: 20px; font-weight: 800; box-shadow: 0 0 0 2px var(--surface); z-index: 10; }
        
        .input-group { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 18px; display: flex; align-items: center; padding: 4px 16px; margin-bottom: 12px; }
        .input-group input { flex: 1; border: none; background: none; font-size: 16px; font-weight: 600; color: var(--text); padding: 12px 0; outline: none; }
        
        .mic-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .mic-btn.listening { background: #FEF2F2; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

        .btn-primary { width: 100%; padding: 17px; background: var(--purple); color: white; border: none; border-radius: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary { width: 100%; padding: 15px; background: transparent; color: var(--text-muted); border: none; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; gap: 16px; }
        .empty-text { font-size: 16px; font-weight: 700; color: var(--text-muted); }
      `}</style>
    </div>
  );
}