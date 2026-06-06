// src/app/api/processar-venda/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ CHAVE DA API NÃO ENCONTRADA!");
      return NextResponse.json({ error: "Chave API não configurada." }, { status: 500 });
    }

    const { audioUrl } = await request.json();
    if (!audioUrl) return NextResponse.json({ error: "URL do áudio não fornecida" }, { status: 400 });

    console.log("⬇️ Baixando áudio:", audioUrl);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error(`Falha ao baixar áudio: ${audioResponse.status}`);

    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-002",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 5. O Prompt de Engenharia com Roteamento Condicional e Exemplos
    const prompt = `Você é um assistente financeiro especializado em extração de dados estruturados.
    Sua tarefa é ouvir o áudio, identificar a intenção do usuário e converter as informações em um formato JSON estrito.

    <Regras de Formatação>
    1. A resposta DEVE ser ÚNICA e EXCLUSIVAMENTE um objeto JSON válido. Nada de blocos markdown (\`\`\`json).
    2. O JSON deve conter exatamente duas chaves: "msg" (string) e "valor" (float).
    3. Analise o contexto do áudio e aplique UMA das três regras de cenário abaixo:

      - CENÁRIO A (Venda com preço): O áudio menciona produtos E preços.
        A "msg" deve seguir o padrão "[Quantidade] [Nome do Produto] de [Valor da Unidade] reais". 
        O "valor" é a soma matemática total da venda.
        
      - CENÁRIO B (Venda sem preço): O áudio menciona produtos, mas NÃO diz o preço.
        A "msg" deve seguir o padrão "[Quantidade] [Nome do Produto]". 
        O "valor" deve ser OBRIGATORIAMENTE 0.00.
        
      - CENÁRIO C (Recado ou Informação): O áudio não é sobre produtos (ex: promessa de pagamento, cobrança, conversa).
        A "msg" deve ser um resumo curto, direto e claro da informação. 
        O "valor" deve ser OBRIGATORIAMENTE 0.00.

    4. Se houver múltiplos itens (Cenário A e B misturados), separe com vírgula e some apenas o que tem preço.
    </Regras de Formatação>

    <Exemplos>
    Áudio: "fernando pegou agora 5 coxinhas de 6 reais cada"
    Saída:
    {
      "msg": "5 coxinhas de 6 reais",
      "valor": 30.00
    }

    Áudio: "o fernando pegou mais duas coxinhas"
    Saída:
    {
      "msg": "2 coxinhas",
      "valor": 0.00
    }

    Áudio: "ele falou que vai me pagar dia 15"
    Saída:
    {
      "msg": "Prometeu pagamento para o dia 15",
      "valor": 0.00
    }

    Áudio: "vendi duas águas por 3 reais e ele também levou um chiclete"
    Saída:
    {
      "msg": "2 águas de 3 reais, 1 chiclete",
      "valor": 6.00
    }
    </Exemplos>

    Extraia as informações do áudio anexado aplicando as regras acima e retorne APENAS o objeto JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "audio/webm", data: base64Audio } }
    ]);

    let textoResposta = result.response.text().trim();
    console.log("🤖 Resposta Gemini:", textoResposta);

    // Melhor limpeza
    textoResposta = textoResposta.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(textoResposta);
    } catch (parseErr) {
      console.error("Erro parse JSON:", parseErr, textoResposta);
      // Fallback
      parsed = { msg: textoResposta.substring(0, 200), valor: 0 };
    }

    return NextResponse.json({ msg: parsed.msg || "", valor: parsed.valor || 0 });

  } catch (erro) {
    console.error("❌ ERRO NA API DE IA:", erro);
    return NextResponse.json({ 
      error: "Falha ao processar o áudio com IA", 
      details: erro.message 
    }, { status: 500 });
  }
}