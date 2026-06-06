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
      // O Console nos dirá a verdade exata sobre o erro
      console.error("⚠️ DETECTADO ERRO NO FETCH DE CLIENTES:", erro);
    } finally {
      setCarregandoLista(false);
    }
  };

  const adicionarCliente = async (nome, arquivo) => {
    try {
      setSalvandoFoto(true);
      await clientService.create(nome, arquivo);
      await fetchClientes();
      return { success: true };
    } catch (erro) {
      console.error("⚠️ ERRO AO CRIAR CLIENTE:", erro);
      return { success: false };
    } finally {
      setSalvandoFoto(false);
    }
  };

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