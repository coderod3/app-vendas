import { useState, useEffect } from "react";
import { clientService } from "@/services/clientService";

export function useClients() {
  const [clientes, setClientes] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  const carregarClientes = async () => {
    setCarregandoLista(true);
    try {
      const data = await clientService.getAll();
      setClientes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const adicionarCliente = async (nome, file) => {
    setSalvandoFoto(true);
    try {
      await clientService.create(nome, file);
      await carregarClientes();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setSalvandoFoto(false);
    }
  };

  const editarCliente = async (id, nome, file) => {
    setSalvandoFoto(true);
    try {
      await clientService.update(id, nome, file);
      await carregarClientes();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setSalvandoFoto(false);
    }
  };

  const deletarCliente = async (id) => {
    try {
      console.log("⚙️ [Hook] Chamando serviço de exclusão...");
      await clientService.delete(id);
      console.log("⚙️ [Hook] Recarregando lista de clientes...");
      await carregarClientes();
      return { success: true };
    } catch (error) {
      console.error("❌ [Hook] Erro capturado ao deletar:", error);
      return { success: false, error };
    }
  };

  return { 
    clientes, 
    carregandoLista, 
    salvandoFoto, 
    adicionarCliente, 
    editarCliente, 
    deletarCliente, 
    recarregar: carregarClientes 
  };
}