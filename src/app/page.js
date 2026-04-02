"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  
  // NOVO: Estado para controlar se a visualização é "lista" ou "grid"
  const [modoVisualizacao, setModoVisualizacao] = useState("lista");

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      setCarregandoLista(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
      alert("Erro ao carregar a lista. Verifique a conexão.");
    } finally {
      setCarregandoLista(false);
    }
  };

  const lidarComNovaFoto = async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    try {
      setSalvandoFoto(true);
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("midias")
        .upload(nomeArquivo, arquivo);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("midias")
        .getPublicUrl(nomeArquivo);

      const { error: dbError } = await supabase
        .from("clientes")
        .insert([{ foto_url: publicUrlData.publicUrl }]);
      if (dbError) throw dbError;

      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      await buscarClientes();
    } catch (erro) {
      console.error("Erro ao salvar cliente:", erro);
      alert("Não foi possível salvar o cliente.");
    } finally {
      setSalvandoFoto(false);
      evento.target.value = null; 
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 relative pb-24">
      {/* Header Atualizado com Botão de Alternância */}
      <header className="bg-green-600 text-white p-5 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Clientes</h1>
        
        {/* Botão para trocar entre Lista e Grid */}
        <button 
          onClick={() => setModoVisualizacao(modoVisualizacao === "lista" ? "grid" : "lista")}
          className="bg-green-700 p-3 rounded-xl text-2xl active:bg-green-800 transition-colors shadow-sm flex items-center justify-center"
        >
          {modoVisualizacao === "lista" ? "🔲" : "📄"}
        </button>
      </header>

      <div className="w-full max-w-lg mx-auto">
        
        {carregandoLista && (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mb-4"></div>
            <p className="text-lg">Carregando contatos...</p>
          </div>
        )}

        {!carregandoLista && clientes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 mt-10">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">Nenhum cliente ainda.</p>
            <p className="text-md mt-2">Toque no botão verde abaixo para adicionar a primeira foto.</p>
          </div>
        )}

        {/* Lógica de Renderização: Lista vs Grid */}
        {!carregandoLista && clientes.length > 0 && (
          <>
            {modoVisualizacao === "lista" ? (
              // MODO LISTA (O original)
              <ul className="flex flex-col bg-white">
                {clientes.map((cliente) => (
                  <li 
                    key={cliente.id} 
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
                ))}
              </ul>
            ) : (
              // MODO GRID (Grade de fotos quadradas grandes)
              <div className="grid grid-cols-2 gap-4 p-4">
                {clientes.map((cliente) => (
                  <div 
                    key={cliente.id} 
                    className="bg-white rounded-2xl shadow-md overflow-hidden active:scale-95 transition-transform cursor-pointer border border-gray-200"
                    onClick={() => router.push(`/cliente/${cliente.id}`)}
                  >
                    <img 
                      src={cliente.foto_url} 
                      alt="Cliente" 
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {salvandoFoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
           <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600 mb-3"></div>
              <p className="text-lg font-bold text-gray-700">Salvando foto...</p>
           </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) */}
      <label className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white text-4xl cursor-pointer hover:bg-green-600 active:scale-95 transition-all z-30">
        <span>+</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={lidarComNovaFoto}
          disabled={salvandoFoto}
        />
      </label>
    </main>
  );
}