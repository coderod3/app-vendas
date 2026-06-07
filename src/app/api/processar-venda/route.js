import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERRO: CHAVE DA API NAO ENCONTRADA!");
      return NextResponse.json({ error: "Chave API nao configurada." }, { status: 500 });
    }

    const { audioUrl } = await request.json();
    if (!audioUrl) return NextResponse.json({ error: "URL do audio nao fornecida" }, { status: 400 });

    console.log("Baixando audio:", audioUrl);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error(`Falha ao baixar audio: ${audioResponse.status}`);

    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Voce e um assistente financeiro especializado em extracao de dados estruturados e calculos matematicos em audio.
    Sua tarefa e ouvir o audio e converter as informacoes em um formato JSON estrito.

    <Regras de Formatacao>
    1. A resposta DEVE ser UNICA e EXCLUSIVAMENTE um objeto JSON valido. Nada de blocos markdown (\`\`\`json).
    2. O JSON deve conter exatamente duas chaves: "msg" (string) e "valor" (float).
    3. Analise o contexto e resolva operacoes matematicas se necessario:

      - CENARIO A (Matematica e Soma): O audio cita valores diretos para somar, ou quantidades multiplicadas por precos.
        A "msg" deve demonstrar a conta estruturada. Ex: "15 + 2x potes de 25 (50) + 12".
        O "valor" deve ser o resultado exato da soma total.

      - CENARIO B (Venda simples): O audio menciona produtos sem focar em grandes contas ou apenas um produto com preco.
        A "msg" deve seguir o padrao "[Quantidade] [Nome do Produto] de [Valor da Unidade] reais".
        O "valor" e a soma matematica da venda.

      - CENARIO C (Recado ou Venda sem Preco): O audio e apenas conversa, informacao ou cita produtos sem informar valores.
        A "msg" deve ser um resumo curto e direto.
        O "valor" deve ser OBRIGATORIAMENTE 0.00.
    </Regras de Formatacao>

    <Exemplos>
    Audio: "15, mais 25, mais 25, e mais 3"
    Saida:
    {
      "msg": "15 + 25 + 25 + 3",
      "valor": 68.00
    }

    Audio: "15, mais dois potes de 25, mais um salgado de 5, mais 12"
    Saida:
    {
      "msg": "15 + 2x potes de 25 (50) + salgado de 5 + 12",
      "valor": 82.00
    }

    Audio: "o fernando pegou mais duas coxinhas mas nao me pagou"
    Saida:
    {
      "msg": "Pegou 2 coxinhas (pendente)",
      "valor": 0.00
    }

    Audio: "vendi duas aguas por 3 reais e ele tambem levou um chiclete"
    Saida:
    {
      "msg": "2 aguas de 3 reais, 1 chiclete",
      "valor": 6.00
    }
    </Exemplos>

    Extraia as informacoes do audio anexado aplicando as regras acima e retorne APENAS o objeto JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "audio/webm", data: base64Audio } }
    ]);

    let textoResposta = result.response.text().trim();
    console.log("Resposta Gemini:", textoResposta);

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
    console.error("ERRO NA API DE IA:", erro);
    return NextResponse.json({ 
      error: "Falha ao processar o audio com IA", 
      details: erro.message 
    }, { status: 500 });
  }
}