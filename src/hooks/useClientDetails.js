import { useState, useEffect } from "react";
import { clientService } from "@/services/clientService";
import { audioService } from "@/services/audioService";

export function useClientDetails(clienteId) {
  const [cliente, setCliente] = useState(null);
  const [audios, setAudios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    if (!clienteId) return;
    
    try {
      setCarregando(true);
      
      // Busca os dados em paralelo para ser mais rápido
      const [clienteData, audiosData] = await Promise.all([
        clientService.getById(clienteId),
        audioService.getByClienteId(clienteId)
      ]);

      setCliente(clienteData);
      setAudios(audiosData);
    } catch (erro) {
      console.error("Erro ao carregar os detalhes:", erro);
      alert("Erro ao carregar o perfil do cliente.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  return { 
    cliente, 
    audios, 
    carregando, 
    recarregarDados: carregarDados 
  };
}