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

  const adicionarCliente = async (nome, arquivo) => { // Recebe nome e arquivo
    try {
      setSalvandoFoto(true);
      await clientService.create(nome, arquivo);
      await fetchClientes();
      return { success: true };
    } catch (erro) {
      alert("Não foi possível salvar o cliente.");
      return { success: false };
    } finally {
      setSalvandoFoto(false);
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