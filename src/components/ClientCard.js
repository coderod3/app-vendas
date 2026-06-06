import { useRouter } from "next/navigation";

export default function ClientCard({ cliente, modoVisualizacao }) {
  const router = useRouter();
  const iniciais = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";

  return (
    <div 
      className={modoVisualizacao === "list" ? "contact-item" : "grid-item"} 
      onClick={() => router.push(`/cliente/${cliente.id}`)}
    >
      <div className={modoVisualizacao === "list" ? "contact-avatar" : "grid-avatar"}>
        {cliente.foto_url ? (
          <img src={cliente.foto_url} alt="" />
        ) : (
          <div className="avatar-placeholder">{iniciais}</div>
        )}
      </div>

      <div className={modoVisualizacao === "list" ? "contact-info" : "grid-info"}>
        <div className={modoVisualizacao === "list" ? "contact-name" : "grid-name"}>
          {cliente.nome || "Registro Antigo"}
        </div>
        
        {/* Etiqueta de dívida para o modo GRID */}
        {modoVisualizacao === "grid" && cliente.total_devido > 0 && (
          <div className="client-debt grid-debt">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.total_devido)}
          </div>
        )}

        {modoVisualizacao === "list" && (
          <div className="contact-last">Toque para ver áudios</div>
        )}
      </div>

      {/* Etiqueta de dívida para o modo LISTA */}
      {modoVisualizacao === "list" && cliente.total_devido > 0 && (
        <div className="client-debt list-debt">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.total_devido)}
        </div>
      )}

      {modoVisualizacao === "list" && <div className="contact-arrow">›</div>}

      <style jsx>{`
        .contact-item { display: flex; align-items: center; padding: 12px 16px; gap: 14px; background: white; border-bottom: 1px solid var(--border); width: 100%; text-align: left; }
        .contact-avatar { width: 55px; height: 55px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: var(--purple); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: 800; }
        .contact-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .contact-info { flex: 1; display: flex; flex-direction: column; align-items: flex-start; overflow: hidden; }
        .contact-name { font-size: 16px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
        .contact-last { font-size: 13px; color: var(--text-muted); }
        .contact-arrow { color: var(--border); font-size: 24px; margin-left: 4px; }

        .grid-item { background: white; border-radius: 20px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; border: 1.5px solid var(--border); }
        .grid-avatar { width: 70px; height: 70px; border-radius: 50%; overflow: hidden; background: var(--purple); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800;}
        .grid-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .grid-info { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; }
        .grid-name { font-size: 14px; font-weight: 800; color: var(--text); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

        /* CSS DA ETIQUETA DE DINHEIRO */
        .client-debt { font-weight: 800; color: #065F46; background: #D1FAE5; border-radius: 10px; white-space: nowrap; }
        .list-debt { font-size: 14px; padding: 6px 10px; margin-left: auto; flex-shrink: 0; }
        .grid-debt { font-size: 12px; padding: 4px 8px; }
      `}</style>
    </div>
  );
}