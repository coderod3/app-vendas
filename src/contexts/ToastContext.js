"use client";

import { createContext, useContext, useState, useCallback } from "react";

// Cria o contexto
const ToastContext = createContext();

// Cria o Provedor que vai abraçar a nossa aplicação
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", visible: false });

  // Função que os componentes vão chamar para mostrar a mensagem
  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    
    // Esconde automaticamente após 3 segundos
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* O HTML do Toast desenhado pelo seu amigo */}
      <div className={`toast ${toast.visible ? 'show' : ''}`}>
        {toast.message}
      </div>

      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: #1A0E40;
          color: white;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 14px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s, transform 0.3s;
          z-index: 9999; /* Fica acima de tudo, incluindo modais */
          pointer-events: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// Hook personalizado para usar o Toast facilmente
export const useToast = () => useContext(ToastContext);