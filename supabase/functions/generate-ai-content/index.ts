
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedText {
  id: number;
  text: string;
}

// Configuração das chaves API por agente
const getAPIKeyForAgent = (agent: string): string[] => {
  const keys: string[] = [];
  
  switch (agent) {
    case "carousel":
      // Chave dedicada para carrossel
      const carouselKey = Deno.env.get('CRIADOR_CARROSSEL');
      if (carouselKey) keys.push(carouselKey);
      break;
    case "yuri":
      // Chave dedicada para criação de textos
      const yuriKey = Deno.env.get('CRIADOR_TEXTO');
      if (yuriKey) keys.push(yuriKey);
      break;
    case "formatter":
      // Chave dedicada para formatação de frases
      const formatterKey = Deno.env.get('CRIADOR_FRASES');
      if (formatterKey) keys.push(formatterKey);
      break;
  }
  
  // Fallback keys
  const fallbackKeys = [
    Deno.env.get('GOOGLE_GEMINI_API_KEY'),
    Deno.env.get('FALLBACK_API_KEY'),
    "AIzaSyBDmxNFfZs3OwBfrYuM8GvE48SIWDzH92w" // Chave principal como último fallback
  ].filter(Boolean);
  
  return [...keys, ...fallbackKeys];
};

async function tryGenerateWithKey(apiKey: string, requestData: any, agent: string): Promise<any> {
  console.log(`Tentando gerar conteúdo com agente ${agent} usando chave: ${apiKey ? apiKey.substring(0, 10) + "..." : "não fornecida"}`);

  if (!apiKey) {
    throw new Error("Chave da API não fornecida");
  }

  const { topic, audience, goal, content, prompt, slideCount } = requestData;
  
  // Sempre gerar 9 slides (máximo permitido)
  const targetSlideCount = 9;

  let systemPrompt = "";
  let userPrompt = "";

  // Configure prompts based on agent type
  if (agent === "carousel") {
    systemPrompt = `Você é um especialista em criação de carrosséis para redes sociais. 
    Sua missão é criar carrosséis completos e envolventes que prendem a atenção do público.
    
    REGRAS IMPORTANTES:
    - Crie EXATAMENTE ${targetSlideCount} slides únicos e distintos
    - Máximo de 25 palavras por slide
    - Use linguagem direta e impactante
    - Crie um fluxo narrativo entre os slides
    - Termine sempre com CTA forte
    - Cada slide deve ter conteúdo diferente e específico
    
    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [texto específico para slide 1]
    Slide 2: [texto específico para slide 2]
    Slide 3: [texto específico para slide 3]
    Slide 4: [texto específico para slide 4]
    Slide 5: [texto específico para slide 5]
    Slide 6: [texto específico para slide 6]
    Slide 7: [texto específico para slide 7]
    Slide 8: [texto específico para slide 8]
    Slide 9: [texto específico para slide 9]`;

    userPrompt = `Crie um carrossel de ${targetSlideCount} slides sobre: ${topic}
    Público-alvo: ${audience || "geral"}
    Objetivo: ${goal || "educar"}
    ${prompt ? `Instruções extras: ${prompt}` : ""}`;
  } else if (agent === "yuri") {
    systemPrompt = `Você é Yuri, um especialista em copywriting viral para carrosséis no Instagram. 
    Sua missão é criar textos persuasivos que engajam e convertem.
    
    REGRAS IMPORTANTES:
    - Crie EXATAMENTE ${targetSlideCount} slides únicos e distintos
    - Máximo de 20 palavras por slide
    - Use linguagem direta e impactante
    - Foque na conversão e engajamento
    - Termine sempre com CTA forte
    - Cada slide deve ter conteúdo diferente e específico
    
    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [texto específico para slide 1]
    Slide 2: [texto específico para slide 2]
    Slide 3: [texto específico para slide 3]
    Slide 4: [texto específico para slide 4]
    Slide 5: [texto específico para slide 5]
    Slide 6: [texto específico para slide 6]
    Slide 7: [texto específico para slide 7]
    Slide 8: [texto específico para slide 8]
    Slide 9: [texto específico para slide 9]`;

    userPrompt = `Crie um carrossel de ${targetSlideCount} slides sobre: ${topic}
    Público-alvo: ${audience || "geral"}
    Objetivo: ${goal || "educar"}
    ${prompt ? `Instruções extras: ${prompt}` : ""}`;
  } else if (agent === "formatter") {
    systemPrompt = `Você é um formatador de textos especializado em carrosséis. 
    Transforme qualquer texto em slides otimizados.
    
    REGRAS:
    - Crie EXATAMENTE ${targetSlideCount} slides únicos e distintos
    - Máximo de 25 palavras por slide
    - Mantenha a essência do conteúdo original
    - Use linguagem clara e direta
    - Cada slide deve ter conteúdo diferente e específico
    
    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [texto específico para slide 1]
    Slide 2: [texto específico para slide 2]
    Slide 3: [texto específico para slide 3]
    Slide 4: [texto específico para slide 4]
    Slide 5: [texto específico para slide 5]
    Slide 6: [texto específico para slide 6]
    Slide 7: [texto específico para slide 7]
    Slide 8: [texto específico para slide 8]
    Slide 9: [texto específico para slide 9]`;

    userPrompt = `Formate este texto em ${targetSlideCount} slides: ${content}
    ${prompt ? `Instruções extras: ${prompt}` : ""}`;
  }

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  console.log(`Enviando prompt para Gemini 2.0 (agente: ${agent})`);

  // Call Gemini 2.0 API with the new model
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;
  
  const response = await fetch(geminiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erro na API Gemini (agente: ${agent}):`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Resposta do Gemini recebida com sucesso (agente: ${agent})`);
  
  if (data.error) {
    console.error(`API Gemini retornou erro (agente: ${agent}):`, data.error);
    throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { agent } = requestData;
    
    console.log("Solicitação recebida para geração de conteúdo IA:", { 
      agent,
      slideCount: requestData.slideCount,
      topicLength: requestData.topic?.length || 0,
      contentLength: requestData.content?.length || 0
    });

    // Obter chaves API para o agente
    const apiKeys = getAPIKeyForAgent(agent);
    
    if (apiKeys.length === 0) {
      throw new Error(`Nenhuma chave API configurada para o agente: ${agent}`);
    }

    console.log(`Tentando ${apiKeys.length} chaves API para o agente: ${agent}`);

    let lastError: Error | null = null;
    let data: any = null;

    // Tentar cada chave sequencialmente
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        console.log(`Tentativa ${i + 1}/${apiKeys.length} para agente ${agent}`);
        data = await tryGenerateWithKey(apiKey, requestData, agent);
        console.log(`Sucesso com chave ${i + 1} para agente ${agent}`);
        break;
      } catch (error: any) {
        console.log(`Falhou com chave ${i + 1} para agente ${agent}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!data) {
      throw new Error(`Todas as chaves falharam para agente ${agent}: ${lastError?.message}`);
    }

    // Extract generated text
    let generatedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      generatedText = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Estrutura de resposta inválida:", JSON.stringify(data));
      throw new Error("Resposta inválida da API Gemini");
    }

    console.log(`Texto gerado recebido (agente: ${agent}):`, generatedText.substring(0, 200) + "...");

    // Parse the generated text into exactly 9 slides
    const targetSlideCount = 9;
    const parsedTexts = parseResponseToSlides(generatedText, targetSlideCount);

    if (parsedTexts.length < targetSlideCount) {
      console.log(`Aviso: Apenas ${parsedTexts.length} slides parseados, esperados ${targetSlideCount}`);
      // Fill missing slides with meaningful content
      while (parsedTexts.length < targetSlideCount) {
        parsedTexts.push({
          id: parsedTexts.length + 1,
          text: `Slide ${parsedTexts.length + 1}: Continue explorando este tema interessante!`
        });
      }
    }

    // Ensure we have exactly 9 slides
    const finalTexts = parsedTexts.slice(0, targetSlideCount);

    console.log(`Geração concluída com sucesso: ${finalTexts.length} slides para agente ${agent}`);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText,
        parsedTexts: finalTexts,
        agent: agent,
        slidesGenerated: finalTexts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na função generate-ai-content:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseResponseToSlides(text: string, maxSlides: number): GeneratedText[] {
  const slides: GeneratedText[] = [];
  
  console.log("Parseando texto da resposta em slides...");
  
  // Try to match "Slide X:" pattern first
  const slideMatches = text.match(/Slide\s*(\d+):\s*([^\n]+?)(?=\s*Slide\s*\d+:|$)/gs);
  
  if (slideMatches && slideMatches.length > 0) {
    console.log(`Encontrados ${slideMatches.length} slides usando padrão Slide`);
    slideMatches.forEach((match, index) => {
      if (index >= maxSlides) return;
      
      const slideNumberMatch = match.match(/Slide\s*(\d+):\s*/);
      const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : index + 1;
      const content = match.replace(/Slide\s*\d+:\s*/, '').trim();
      
      if (content) {
        slides.push({
          id: slideNumber,
          text: content
        });
      }
    });
  } else {
    console.log("Nenhum padrão Slide encontrado, tentando parse linha por linha");
    // Fallback: split by lines and create slides
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      if (index >= maxSlides) return;
      
      const cleanLine = line.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim();
      if (cleanLine && cleanLine.length > 10) { // Minimum content length
        slides.push({
          id: index + 1,
          text: cleanLine
        });
      }
    });
  }

  console.log(`Parse concluído com sucesso: ${slides.length} slides`);
  return slides.slice(0, maxSlides);
}
