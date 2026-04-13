export default function RecordControl({ 
  estaGravando, 
  processandoAudio, 
  iniciarGravacao, 
  pararGravacao 
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center border-t border-gray-200">
      
      {processandoAudio && (
        <p className="text-green-600 font-bold mb-2 animate-pulse">Salvando na nuvem...</p>
      )}

      <button
        onPointerDown={iniciarGravacao}
        onPointerUp={pararGravacao}
        onPointerLeave={pararGravacao}
        onPointerCancel={pararGravacao}
        onContextMenu={(e) => e.preventDefault()}
        disabled={processandoAudio}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl transition-all select-none touch-none ${
          estaGravando 
            ? "bg-red-500 scale-110 animate-pulse ring-4 ring-red-200" 
            : "bg-green-500 active:scale-95"
        }`}
      >
        {estaGravando ? "⏹️" : "🎤"}
      </button>
      
      <p className="text-gray-400 text-sm mt-3 font-medium select-none">
        {estaGravando ? "Solte para salvar" : "Segure para gravar"}
      </p>
    </div>
  );
}