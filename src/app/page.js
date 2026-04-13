"use client";

import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import ClientCard from "@/components/ClientCard";

export default function Home() {
  // O Hook gerencia toda a lógica complexa de dados
  const { clientes, carregandoLista, salvandoFoto, adicionarCliente } = useClients();
  
  // O componente gerencia apenas a lógica visual
  const [modoVisualizacao, setModoVisualizacao] = useState("lista");

  return (
    <main className="min-h-screen bg-gray-100 relative pb-24">
      
      {/* Header */}
      <header className="bg-green-600 text-white p-5 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Clientes</h1>
        <button 
          onClick={() => setModoVisualizacao(modoVisualizacao === "lista" ? "grid" : "lista")}
          className="bg-green-700 p-3 rounded-xl text-2xl active:bg-green-800 transition-colors shadow-sm flex items-center justify-center"
        >
          {modoVisualizacao === "lista" ? "🔲" : "📄"}
        </button>
      </header>

      {/* Conteúdo Central */}
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

        {!carregandoLista && clientes.length > 0 && (
          modoVisualizacao === "lista" ? (
            <ul className="flex flex-col bg-white">
              {clientes.map((cliente) => (
                <ClientCard key={cliente.id} cliente={cliente} modoVisualizacao="lista" />
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4">
              {clientes.map((cliente) => (
                <ClientCard key={cliente.id} cliente={cliente} modoVisualizacao="grid" />
              ))}
            </div>
          )
        )}
      </div>

      {/* Overlays e Botões Flutuantes */}
      {salvandoFoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
           <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600 mb-3"></div>
              <p className="text-lg font-bold text-gray-700">Salvando foto...</p>
           </div>
        </div>
      )}

      <label className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white text-4xl cursor-pointer hover:bg-green-600 active:scale-95 transition-all z-30">
        <span>+</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={adicionarCliente}
          disabled={salvandoFoto}
        />
      </label>
      
    </main>
  );
}