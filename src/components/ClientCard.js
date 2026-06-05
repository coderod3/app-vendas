import { useRouter } from "next/navigation";

export default function ClientCard({ cliente, modoVisualizacao }) {
  const router = useRouter();
  // Se não tiver nome, usa "C" de cliente ou a primeira letra do nome
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

      <div className={modoVisualizacao === "list" ? "contact-info" : ""}>
        <div className={modoVisualizacao === "list" ? "contact-name" : "grid-name"}>
          {cliente.nome || "Registro Antigo"}
        </div>
        {modoVisualizacao === "list" && (
          <div className="contact-last">Toque para ver áudios</div>
        )}
      </div>

      {modoVisualizacao === "list" && <div className="contact-arrow">›</div>}

      <style jsx>{`
        .contact-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 16px;
          background: white;
          border-bottom: 1px solid var(--border);
          width: 100%;
          text-align: left; /* Garante alinhamento à esquerda */
        }
        .contact-avatar {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
        }
        .contact-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .contact-info { flex: 1; display: flex; flex-direction: column; align-items: flex-start; }
        .contact-name { font-size: 16px; font-weight: 800; color: var(--text); }
        .contact-last { font-size: 13px; color: var(--text-muted); }
        .contact-arrow { color: var(--border); font-size: 24px; margin-left: auto; }

        .grid-item {
          background: white; border-radius: 20px; padding: 15px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          border: 1.5px solid var(--border);
        }
        .grid-avatar { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--purple); }
        .grid-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .grid-name { font-size: 14px; font-weight: 800; color: var(--text); text-align: center; }
      `}</style>
    </div>
  );
}