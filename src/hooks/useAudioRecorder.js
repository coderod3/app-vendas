import { useState, useRef } from "react";
import { audioService } from "@/services/audioService";
import { useToast } from "@/contexts/ToastContext"; // 1. Importamos o Toast

export function useAudioRecorder(clienteId, onUploadSuccess) {
  const [estaGravando, setEstaGravando] = useState(false);
  const [processandoAudio, setProcessandoAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const isPressingRef = useRef(false);
  
  const { showToast } = useToast(); // 2. Chamamos a função

  const iniciarGravacao = async () => {
    isPressingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!isPressingRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return; 
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) chunksRef.current.push(evento.data);
      };

      mediaRecorder.onstop = async () => {
        setProcessandoAudio(true);
        showToast("✨ A IA está a analisar a venda...");
        stream.getTracks().forEach(track => track.stop());
        
        const blobDoAudio = new Blob(chunksRef.current, { type: "audio/webm" });
        
        try {
          await audioService.uploadAndSave(clienteId, blobDoAudio);
          showToast("Venda registada com sucesso! ✅");
          if (onUploadSuccess) onUploadSuccess();
        } catch (erro) {
          console.error("Erro ao salvar:", erro);
          showToast("❌ Falha ao salvar a gravação."); // Toast de erro
        } finally {
          setProcessandoAudio(false);
        }
      };

      mediaRecorder.start();
      setEstaGravando(true);

      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

    } catch (erro) {
      console.error("Erro de microfone:", erro);
      isPressingRef.current = false;
      showToast("⚠️ Permita o uso do microfone no navegador."); // Trocamos o alert pelo Toast
    }
  };

  const pararGravacao = () => {
    isPressingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setEstaGravando(false);
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
    }
  };

  return { estaGravando, processandoAudio, iniciarGravacao, pararGravacao };
}