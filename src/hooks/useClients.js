import { useState, useEffect } from "react";
import { clientService } from "@/services/clientService";

export function useClients() {
  const [clientes, setClientes] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  const fetchClientes = async () => {
    try {
      setCarregandoLista(true);
      const data = await clientService.getAll();
      setClientes(data);
    } catch (erro) {
      alert("Erro ao carregar a lista. Verifique a conexão com a internet.");
    } finally {
      setCarregandoLista(false);
    }
  };

  const adicionarCliente = async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    try {
      setSalvandoFoto(true);
      
      // A mágica acontece aqui: chamamos o serviço sem nos importar com os detalhes do Supabase
      await clientService.create(arquivo);

      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      await fetchClientes();
    } catch (erro) {
        console.error("ERRO DETALHADO NO HOOK:", erro); // ISSO vai te dar a linha vermelha que falta
        alert("Erro ao carregar a lista.");
        
    } finally {
      setSalvandoFoto(false);
      evento.target.value = null; 
    }
  };

  // Carrega os clientes assim que o hook é utilizado
  useEffect(() => {
    fetchClientes();
  }, []);

  return { 
    clientes, 
    carregandoLista, 
    salvandoFoto, 
    adicionarCliente 
  };
}