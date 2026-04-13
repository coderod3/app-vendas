import { useRouter } from "next/navigation";

export default function ClientCard({ cliente, modoVisualizacao }) {
  const router = useRouter();

  if (modoVisualizacao === "lista") {
    return (
      <li 
        className="flex items-center p-4 border-b border-gray-200 active:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => router.push(`/cliente/${cliente.id}`)}
      >
        <img 
          src={cliente.foto_url} 
          alt="Cliente" 
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm"
        />
        <div className="ml-auto text-gray-300 text-3xl">›</div>
      </li>
    );
  }

  // Se não for lista, obrigatoriamente é o modo Grid
  return (
    <div 
      className="bg-white rounded-2xl shadow-md overflow-hidden active:scale-95 transition-transform cursor-pointer border border-gray-200"
      onClick={() => router.push(`/cliente/${cliente.id}`)}
    >
      <img 
        src={cliente.foto_url} 
        alt="Cliente" 
        className="w-full aspect-square object-cover"
      />
    </div>
  );
}