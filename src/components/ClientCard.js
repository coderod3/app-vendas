import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientCard({ cliente, modoVisualizacao, onEdit, onDelete }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const iniciais = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";
  const totalDevido = cliente.total_devido || 0;
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCardClick = () => {
    if (!menuOpen) {
      router.push(`/cliente/${cliente.id}`);
    }
  };

  return (
    <div className={`client-card ${modoVisualizacao}`}>
      
      <div className="card-click-area" onClick={handleCardClick}>
        <div className="client-avatar">
          {cliente.foto_url ? <img src={cliente.foto_url} alt={cliente.nome} /> : iniciais}
        </div>
        <div className="client-info">
          <h3 className="client-name">{cliente.nome}</h3>
          <span className="client-total">{formatadorMoeda.format(totalDevido)}</span>
        </div>
      </div>

      <div className="menu-container">
        <button 
          className="menu-btn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="19" r="2" fill="currentColor"/>
          </svg>
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            <button 
              type="button" 
              className="menu-item edit" 
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                if (onEdit) onEdit(cliente);
              }}
            >
              Editar
            </button>
            
            <button 
              type="button" 
              className="menu-item delete" 
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                
                // DIAGNÓSTICO ATIVO
                if (onDelete) {
                  onDelete(cliente);
                } else {
                  alert("ERRO DE CÓDIGO: O seu page.js não está a passar a função onDelete para o ClientCard.");
                }
              }}
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .client-card { background: var(--surface); border-radius: 20px; border: 1.5px solid var(--border); margin-bottom: 10px; display: flex; align-items: center; position: relative; transition: transform 0.1s; }
        .client-card:active { transform: scale(0.98); }
        .card-click-area { flex: 1; display: flex; align-items: center; gap: 14px; padding: 14px 16px; cursor: pointer; overflow: hidden; }
        .client-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; overflow: hidden; flex-shrink: 0; }
        .client-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .client-info { flex: 1; overflow: hidden; }
        .client-name { font-size: 16px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 4px; }
        .client-total { font-size: 14px; font-weight: 700; color: var(--green); }
        .menu-container { position: relative; padding-right: 8px; }
        .menu-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .menu-btn:active { background: var(--surface2); }
        .menu-dropdown { position: absolute; right: 8px; top: 35px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; width: 120px; z-index: 100; overflow: hidden; }
        .menu-item { padding: 12px 16px; background: none; border: none; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; border-bottom: 1px solid var(--surface2); }
        .menu-item:last-child { border-bottom: none; }
        .menu-item.edit { color: var(--text); }
        .menu-item.delete { color: #DC2626; }
      `}</style>
    </div>
  );
}