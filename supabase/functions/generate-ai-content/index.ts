
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
  console.log(`[${agent.toUpperCase()}] Iniciando geração com chave especializada: ${apiKey ? apiKey.substring(0, 10) + "..." : "não fornecida"}`);

  if (!apiKey) {
    throw new Error("Chave da API não fornecida");
  }

  const { topic, audience, goal, content, prompt } = requestData;
  
  // Sempre gerar 9 slides (máximo permitido)
  const targetSlideCount = 9;

  let systemPrompt = "";
  let userPrompt = "";

  // Configure prompts especializados based on agent type
  if (agent === "carousel") {
    systemPrompt = `🔥 IDENTIDADE CRIADOR_CARROSSEL
    Você é um especialista lendário em copywriting e engenharia de prompts, com 30 anos de experiência no topo do mercado digital. Sua habilidade combina a mente analítica de um engenheiro de IA com o talento persuasivo de um copywriter focado em conversão. Seu histórico inclui estratégias que geraram múltiplos 7 dígitos em faturamento. Você domina profundamente copywriting persuasivo, neurovendas, gatilhos mentais e criação de carrosséis virais com alto poder de retenção e engajamento.

    📌 REGRAS FUNDAMENTAIS:
    - A mentalidade de viralidade deve ser aplicada em todos os carrosséis
    - O primeiro slide deve conter um hook irresistível que prenda imediatamente a atenção
    - Slides intermediários devem aprofundar o problema com storytelling, análises e identificação com o público
    - Slides de solução devem apresentar estratégias originais, sempre com base em dados reais ou provas sociais
    - Slides finais devem conter um CTA estratégico de acordo com o objetivo do conteúdo
    - Aplique constantemente gatilhos mentais: autoridade, escassez, prova social, reciprocidade, curiosidade e urgência
    - Linguagem estratégica, fluida e emocionalmente inteligente
    - Adapte o conteúdo de acordo com público, nicho e plataforma

    ⛔ RESTRIÇÕES INVIOLÁVEIS:
    - NUNCA utilize bullet points, listas numeradas, traços, emojis ou versos separados em linhas distintas
    - Todo o conteúdo deve ser redigido em parágrafos densos e corridos, com conectores e ritmo fluido
    - É proibido o uso de estruturas que possam quebrar o fluxo de leitura ou parecer automáticas demais

    🧠 FRAMEWORK ESTRUTURADO PARA ${targetSlideCount} SLIDES:
    - Slide 1: Hook que ativa curiosidade ou instinto de urgência
    - Slides 2-3: Profundidade do problema com identificação e storytelling
    - Slides 4-6: Contexto técnico e aprofundamento do problema
    - Slides 7-8: Solução prática com frameworks, insights e estudos de caso
    - Slide 9: Fechamento com CTA poderoso, reflexão ou provocação estratégica

    🧪 PROCESSO DE QUALIDADE OBRIGATÓRIO:
    Antes de finalizar, revise se:
    - Está envolvente do início ao fim?
    - O conteúdo é denso, profundo e com insights acionáveis?
    - A estrutura está 100% fluida, sem listas ou quebras automáticas?
    - O CTA está alinhado com o objetivo estratégico?

    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [texto fluido em parágrafo]
    Slide 2: [texto fluido em parágrafo]
    Slide 3: [texto fluido em parágrafo]
    Slide 4: [texto fluido em parágrafo]
    Slide 5: [texto fluido em parágrafo]
    Slide 6: [texto fluido em parágrafo]
    Slide 7: [texto fluido em parágrafo]
    Slide 8: [texto fluido em parágrafo]
    Slide 9: [texto fluido em parágrafo]`;

    userPrompt = `BRIEFING COMPLETO:
    Tema: ${topic}
    Público-alvo: ${audience || "Público geral interessado no tema"}
    Objetivo: ${goal || "Educar"}
    ${prompt ? `Detalhes adicionais: ${prompt}` : ""}
    
    Crie um carrossel viral de ${targetSlideCount} slides seguindo rigorosamente o framework estruturado e as regras fundamentais.`;

  } else if (agent === "yuri") {
    systemPrompt = `📉 CRIADOR_TEXTO - ESTRUTURAÇÃO AVANÇADA PARA CARROSSEL
    Você é um especialista em transformar conteúdo em carrosséis otimizados com estrutura rigorosa e distribuição precisa de palavras.

    🎯 INSTRUÇÕES ESPECÍFICAS PARA ${targetSlideCount} SLIDES:
    - Gerar EXATAMENTE ${targetSlideCount} slides numerados
    - Cada slide deve seguir a distribuição otimizada de palavras para máximo impacto
    - Manter coesão narrativa entre todos os slides
    - Garantir que cada slide tenha conteúdo substancial e específico

    📊 DISTRIBUIÇÃO OTIMIZADA DE PALAVRAS POR SLIDE:
    - Slide 1: 8-12 palavras (hook de abertura)
    - Slide 2: 15-20 palavras (contexto inicial)
    - Slide 3: 25-30 palavras (desenvolvimento do problema)
    - Slide 4: 20-25 palavras (aprofundamento)
    - Slide 5: 35-40 palavras (solução principal)
    - Slide 6: 15-20 palavras (benefício-chave)
    - Slide 7: 30-35 palavras (prova social/exemplo)
    - Slide 8: 25-30 palavras (aplicação prática)
    - Slide 9: 12-18 palavras (CTA final)

    🔧 REGRAS ESTRUTURAIS OBRIGATÓRIAS:
    - Formato obrigatório: "Slide X: [conteúdo]"
    - Não incluir emojis, marcações extras, bullets ou subtítulos
    - Cada slide deve estar o mais próximo possível da contagem especificada
    - Manter integridade e fluxo do conteúdo original
    - Resultado 100% pronto para uso

    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [8-12 palavras]
    Slide 2: [15-20 palavras]
    Slide 3: [25-30 palavras]
    Slide 4: [20-25 palavras]
    Slide 5: [35-40 palavras]
    Slide 6: [15-20 palavras]
    Slide 7: [30-35 palavras]
    Slide 8: [25-30 palavras]
    Slide 9: [12-18 palavras]`;

    userPrompt = `CONTEÚDO PARA ESTRUTURAÇÃO:
    Tema: ${topic}
    Público-alvo: ${audience || "Público geral"}
    Objetivo: ${goal || "Educar"}
    ${content ? `Conteúdo base: ${content}` : ""}
    ${prompt ? `Instruções adicionais: ${prompt}` : ""}
    
    Transforme em ${targetSlideCount} slides seguindo rigorosamente a distribuição de palavras especificada.`;

  } else if (agent === "formatter") {
    systemPrompt = `🏆 CRIADOR_FRASES - ESPECIALISTA EM FRASES DE IMPACTO
    Você é um especialista em transformar textos em carrosséis prontos para redes sociais, focado em extrair frases de impacto, organizar progressão do conteúdo e gerar estrutura ideal para posts em formato carrossel.

    📌 COMO ATUAR:
    - Leia o conteúdo e identifique as ideias principais
    - Divida em frases curtas e impactantes, uma por slide
    - Comece com frase de abertura forte (para atrair atenção)
    - Termine com chamada para ação ou frase de encerramento marcante
    - Utilize linguagem acessível, direta e com tom alinhado ao público

    🎯 NÍVEIS DE COMPLEXIDADE:
    - Básico: Quebra de frases por sentido e ritmo visual
    - Intermediário: Ajuste de tom e storytelling progressivo
    - Avançado: Reformulação criativa com copywriting persuasivo

    🛠️ TÉCNICAS AVANÇADAS:
    - Prompt Synthesis (fusão de ideias centrais em frases poderosas)
    - Copywriting AIDA (Atenção, Interesse, Desejo, Ação)
    - Metáforas e analogias leves para impacto emocional

    📊 ESTRUTURA PARA ${targetSlideCount} SLIDES:
    - Slide 1: Frase de abertura forte e impactante
    - Slides 2-3: Desenvolvimento da ideia principal
    - Slides 4-6: Aprofundamento com insights valiosos
    - Slides 7-8: Aplicação prática ou exemplos
    - Slide 9: CTA ou frase de encerramento marcante

    ⚠️ RESTRIÇÕES:
    - Nunca copie frases de terceiros sem autorização
    - Evite jargões técnicos desnecessários
    - Não gerar frases longas - mantenha visualmente limpo
    - Máximo de 25 palavras por slide para legibilidade

    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Slide 1: [frase de impacto]
    Slide 2: [desenvolvimento]
    Slide 3: [aprofundamento]
    Slide 4: [insight valioso]
    Slide 5: [solução/benefício]
    Slide 6: [prova/exemplo]
    Slide 7: [aplicação prática]
    Slide 8: [resultado esperado]
    Slide 9: [CTA marcante]`;

    userPrompt = `MATERIAL PARA TRANSFORMAÇÃO EM FRASES DE IMPACTO:
    ${content ? `Texto base: ${content}` : `Tema: ${topic}`}
    Público-alvo: ${audience || "Público das redes sociais"}
    Objetivo: ${goal || "Engajar"}
    Tom desejado: ${goal === 'vender' ? 'persuasivo' : goal === 'inspirar' ? 'motivacional' : 'educativo'}
    ${prompt ? `Direcionamentos específicos: ${prompt}` : ""}
    
    Transforme em ${targetSlideCount} frases de impacto seguindo a estrutura progressiva especificada.`;
  }

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  console.log(`[${agent.toUpperCase()}] Enviando prompt especializado para Gemini 2.0`);

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
        temperature: agent === 'carousel' ? 0.8 : agent === 'yuri' ? 0.4 : 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${agent.toUpperCase()}] Erro na API Gemini:`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[${agent.toUpperCase()}] Resposta especializada recebida com sucesso`);
  
  if (data.error) {
    console.error(`[${agent.toUpperCase()}] API Gemini retornou erro:`, data.error);
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
    
    console.log(`[${agent?.toUpperCase() || 'UNKNOWN'}] Solicitação recebida para geração especializada:`, { 
      agent,
      topicLength: requestData.topic?.length || 0,
      contentLength: requestData.content?.length || 0,
      hasAudience: !!requestData.audience,
      goal: requestData.goal
    });

    // Obter chaves API para o agente
    const apiKeys = getAPIKeyForAgent(agent);
    
    if (apiKeys.length === 0) {
      throw new Error(`Nenhuma chave API configurada para o agente: ${agent}`);
    }

    console.log(`[${agent.toUpperCase()}] Tentando ${apiKeys.length} chaves API especializadas`);

    let lastError: Error | null = null;
    let data: any = null;

    // Tentar cada chave sequencialmente
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        console.log(`[${agent.toUpperCase()}] Tentativa ${i + 1}/${apiKeys.length} com prompt especializado`);
        data = await tryGenerateWithKey(apiKey, requestData, agent);
        console.log(`[${agent.toUpperCase()}] Sucesso com chave ${i + 1} - prompt especializado aplicado`);
        break;
      } catch (error: any) {
        console.log(`[${agent.toUpperCase()}] Falhou com chave ${i + 1}:`, error.message);
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
      console.error(`[${agent.toUpperCase()}] Estrutura de resposta inválida:`, JSON.stringify(data));
      throw new Error("Resposta inválida da API Gemini");
    }

    console.log(`[${agent.toUpperCase()}] Texto especializado gerado:`, generatedText.substring(0, 150) + "...");

    // Parse the generated text into exactly 9 slides with improved parsing
    const targetSlideCount = 9;
    const parsedTexts = parseResponseToSlidesAdvanced(generatedText, targetSlideCount, agent);

    if (parsedTexts.length < targetSlideCount) {
      console.log(`[${agent.toUpperCase()}] Aviso: Apenas ${parsedTexts.length} slides parseados, completando até ${targetSlideCount}`);
      // Fill missing slides with meaningful content based on agent type
      while (parsedTexts.length < targetSlideCount) {
        const slideNumber = parsedTexts.length + 1;
        let defaultContent = "";
        
        if (agent === "carousel") {
          defaultContent = `Continue explorando este tema fascinante que pode transformar seus resultados de forma definitiva.`;
        } else if (agent === "yuri") {
          defaultContent = `Slide ${slideNumber}: Aplicação prática dessas estratégias em sua realidade.`;
        } else if (agent === "formatter") {
          defaultContent = `Aplique essas ideias hoje mesmo.`;
        }
        
        parsedTexts.push({
          id: slideNumber,
          text: defaultContent
        });
      }
    }

    // Ensure we have exactly 9 slides
    const finalTexts = parsedTexts.slice(0, targetSlideCount);

    console.log(`[${agent.toUpperCase()}] Geração especializada concluída: ${finalTexts.length} slides de alta qualidade`);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText,
        parsedTexts: finalTexts,
        agent: agent,
        slidesGenerated: finalTexts.length,
        qualityMetrics: {
          agentSpecialized: true,
          promptType: agent,
          slidesTargeted: targetSlideCount,
          slidesDelivered: finalTexts.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na função generate-ai-content especializada:', error);
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

function parseResponseToSlidesAdvanced(text: string, maxSlides: number, agent: string): GeneratedText[] {
  const slides: GeneratedText[] = [];
  
  console.log(`[${agent.toUpperCase()}] Iniciando parsing avançado para ${maxSlides} slides`);
  
  // Try to match "Slide X:" pattern first (most precise)
  const slideMatches = text.match(/Slide\s*(\d+):\s*([^\n]+?)(?=\s*Slide\s*\d+:|$)/gs);
  
  if (slideMatches && slideMatches.length > 0) {
    console.log(`[${agent.toUpperCase()}] Encontrados ${slideMatches.length} slides usando padrão Slide:`);
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
  } else if (agent === "yuri" || agent === "formatter") {
    // Try alternative parsing for structured agents
    console.log(`[${agent.toUpperCase()}] Tentando parsing alternativo para agente estruturado`);
    
    // Try "texto X -" pattern for yuri agent
    const textMatches = text.match(/texto\s*(\d+)\s*-\s*([^\n]+?)(?=\s*texto\s*\d+\s*-|$)/gs);
    
    if (textMatches && textMatches.length > 0) {
      console.log(`[${agent.toUpperCase()}] Encontrados ${textMatches.length} blocos usando padrão texto:`);
      textMatches.forEach((match, index) => {
        if (index >= maxSlides) return;
        
        const content = match.replace(/texto\s*\d+\s*-\s*/, '').trim();
        if (content) {
          slides.push({
            id: index + 1,
            text: content
          });
        }
      });
    } else {
      // Fallback: split by meaningful breaks
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
      if (paragraphs.length > 0) {
        paragraphs.slice(0, maxSlides).forEach((paragraph, index) => {
          slides.push({
            id: index + 1,
            text: paragraph.trim()
          });
        });
      }
    }
  } else {
    console.log(`[${agent.toUpperCase()}] Usando parsing linha por linha como fallback`);
    // Fallback: split by lines and create slides
    const lines = text.split('\n').filter(line => line.trim().length > 15);
    lines.forEach((line, index) => {
      if (index >= maxSlides) return;
      
      const cleanLine = line.replace(/^\d+\.\s*|\-\s*|\*\s*|texto\s*\d+\s*-\s*/i, '').trim();
      if (cleanLine && cleanLine.length > 10) {
        slides.push({
          id: index + 1,
          text: cleanLine
        });
      }
    });
  }

  console.log(`[${agent.toUpperCase()}] Parse avançado concluído: ${slides.length} slides de qualidade`);
  return slides.slice(0, maxSlides);
}
