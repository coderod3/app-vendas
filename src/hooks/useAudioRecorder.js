import { useState, useRef } from "react";
import { audioService } from "@/services/audioService";

export function useAudioRecorder(clienteId, onUploadSuccess) {
  const [estaGravando, setEstaGravando] = useState(false);
  const [processandoAudio, setProcessandoAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setProcessandoAudio(true);
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          await audioService.uploadAndSave(clienteId, blob);
          if (onUploadSuccess) onUploadSuccess();
        } finally {
          setProcessandoAudio(false);
        }
      };

      mediaRecorder.start();
      setEstaGravando(true);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    } catch (err) {
      alert("Erro ao acessar microfone.");
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && estaGravando) {
      mediaRecorderRef.current.stop();
      setEstaGravando(false);
      if (window.navigator.vibrate) window.navigator.vibrate([50, 100, 50]);
    }
  };

  return { estaGravando, processandoAudio, iniciarGravacao, pararGravacao };
}