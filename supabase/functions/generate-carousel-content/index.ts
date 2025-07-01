import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  topic: string;
  audience: string;
  intention: string;
  slideCount: number;
  context?: string;
}

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

interface GenerationResponse {
  success: boolean;
  slides?: SlideContent[];
  error?: string;
  agent_logs?: string[];
}

// System prompts para cada agente especializado
const AGENT_PROMPTS = {
  roteirista: `Você é o ROTEIRISTA, especialista em storytelling emocional.
  
MISSÃO: Criar uma narrativa envolvente que conecta emocionalmente o leitor slide após slide.

REGRAS OBRIGATÓRIAS:
- Use experiências humanas reais e metáforas
- Crie uma linha de raciocínio fluida
- Prenda a atenção desde o primeiro slide
- Mantenha consistência emocional

ESTRUTURA DE RESPOSTA (JSON):
{
  "slides": [
    {
      "title": "TÍTULO EM CAIXA ALTA",
      "subtitle": "Subtítulo que explica",
      "body": ["Linha com gancho emocional", "Linha que desenvolve", "Linha de transição"]
    }
  ]
}`,

  copywriter: `Você é o COPYWRITER, especialista em persuasão e conversão.

MISSÃO: Aplicar técnicas de copywriting para gerar interesse, criar urgência e converter.

TÉCNICAS OBRIGATÓRIAS:
- Gatilhos mentais (escassez, autoridade, curiosidade)
- Ganchos irresistíveis nos títulos
- CTA claro e direto no último slide
- Linguagem persuasiva sem ser vendedora

ESTRUTURA DE RESPOSTA (JSON):
{
  "slides": [
    {
      "title": "TÍTULO COM GANCHO",
      "subtitle": "Subtítulo que gera curiosidade",
      "body": ["Linha com gatilho mental", "Linha que persuade", "Linha que converte"]
    }
  ]
}`,

  editor: `Você é o EDITOR, especialista em estrutura e fluxo de conteúdo.

MISSÃO: Garantir que o conteúdo flua perfeitamente, respeitando limites e clareza.

RESPONSABILIDADES:
- Distribuir conteúdo equilibradamente
- Respeitar limite de 30-60 palavras por slide
- Garantir ritmo adequado entre slides
- Otimizar legibilidade

ESTRUTURA DE RESPOSTA (JSON):
{
  "slides": [
    {
      "title": "TÍTULO OTIMIZADO",
      "subtitle": "Subtítulo claro e direto",
      "body": ["Linha concisa", "Linha com impacto", "Linha de conclusão"]
    }
  ]
}`,

  supervisor: `Você é o SUPERVISOR, especialista em qualidade e refinamento final.

MISSÃO: Fazer a verificação final, elevando a qualidade emocional e técnica do conteúdo.

VERIFICAÇÕES OBRIGATÓRIAS:
- Eliminar clichês e repetições
- Verificar conexão emocional
- Garantir tom adequado ao público
- Elevar o nível de impacto

ESTRUTURA DE RESPOSTA (JSON):
{
  "slides": [
    {
      "title": "TÍTULO REFINADO",
      "subtitle": "Subtítulo aprimorado",
      "body": ["Linha polida", "Linha com impacto elevado", "Linha de fechamento forte"]
    }
  ]
}`
};

async function callGeminiAgent(agentType: string, content: string, request: GenerationRequest): Promise<any> {
  const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('Chave da API Gemini não configurada');
  }

  const systemPrompt = AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS];
  const userPrompt = `
DADOS DO PROJETO:
- Tema: ${request.topic}
- Público: ${request.audience}
- Intenção: ${request.intention}
- Número de slides: ${request.slideCount}
- Contexto adicional: ${request.context || 'Nenhum'}

${content ? `CONTEÚDO PARA REFINAR:\n${content}` : 'CRIAR CONTEÚDO NOVO'}

Retorne APENAS um JSON válido seguindo a estrutura especificada. Não adicione texto antes ou depois do JSON.`;

  console.log(`🤖 Chamando agente ${agentType} com API key: ${apiKey ? 'configurada' : 'ausente'}`);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      })
    });

    console.log(`📡 Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro detalhado da API: ${errorText}`);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`📄 Estrutura da resposta:`, JSON.stringify(data, null, 2));
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('Resposta vazia da API Gemini');
    }

    // Limpar e extrair JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`❌ Erro no agente ${agentType}:`, error);
    console.error(`🔧 Detalhes técnicos:`, {
      agentType,
      hasApiKey: !!apiKey,
      requestSize: userPrompt.length
    });
    throw error;
  }
}

async function generateWithAgentPipeline(request: GenerationRequest): Promise<GenerationResponse> {
  const logs: string[] = [];
  
  try {
    // ETAPA 1: ROTEIRISTA - Cria a narrativa base
    logs.push('🎬 Iniciando agente ROTEIRISTA...');
    const roteiristaResult = await callGeminiAgent('roteirista', '', request);
    logs.push('✅ Roteirista concluído');

    // ETAPA 2: COPYWRITER - Adiciona persuasão
    logs.push('✍️ Iniciando agente COPYWRITER...');
    const copywriterResult = await callGeminiAgent('copywriter', JSON.stringify(roteiristaResult), request);
    logs.push('✅ Copywriter concluído');

    // ETAPA 3: EDITOR - Ajusta estrutura
    logs.push('📝 Iniciando agente EDITOR...');
    const editorResult = await callGeminiAgent('editor', JSON.stringify(copywriterResult), request);
    logs.push('✅ Editor concluído');

    // ETAPA 4: SUPERVISOR - Refinamento final
    logs.push('🔍 Iniciando agente SUPERVISOR...');
    const supervisorResult = await callGeminiAgent('supervisor', JSON.stringify(editorResult), request);
    logs.push('✅ Supervisor concluído');

    // Validação final
    const slides = supervisorResult.slides || [];
    
    // Garantir número correto de slides
    const targetSlides = Math.max(Math.min(request.slideCount, 12), 4);
    
    if (slides.length < targetSlides) {
      // Completar slides faltantes
      for (let i = slides.length; i < targetSlides; i++) {
        slides.push({
          title: `SLIDE ${i + 1}`,
          subtitle: `Conteúdo sobre ${request.topic}`,
          body: [`Ponto ${i + 1} sobre o tema`, "Desenvolva este tópico", "Conecte com o próximo slide"]
        });
      }
    } else if (slides.length > targetSlides) {
      slides.splice(targetSlides);
    }

    // Garantir que o último slide tenha CTA
    if (slides.length > 0) {
      const lastSlide = slides[slides.length - 1];
      if (!lastSlide.body.some(line => line.toLowerCase().includes('acesse') || 
                                     line.toLowerCase().includes('clique') ||
                                     line.toLowerCase().includes('saiba mais') ||
                                     line.toLowerCase().includes('confira'))) {
        lastSlide.body.push("👆 Acesse o link para saber mais!");
      }
    }

    logs.push(`🎯 Pipeline concluído: ${slides.length} slides gerados`);

    return {
      success: true,
      slides,
      agent_logs: logs
    };

  } catch (error) {
    logs.push(`❌ Erro no pipeline: ${error.message}`);
    return {
      success: false,
      error: error.message,
      agent_logs: logs
    };
  }
}

async function generateWithStreamingPipeline(request: GenerationRequest, controller: ReadableStreamDefaultController) {
  const sendEvent = (type: string, data: any) => {
    const event = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(event));
  };

  try {
    sendEvent('progress', { stage: 'roteirista', message: '🎬 Iniciando agente ROTEIRISTA...', progress: 10 });
    
    const roteiristaResult = await callGeminiAgent('roteirista', '', request);
    sendEvent('progress', { stage: 'roteirista', message: '✅ Roteirista concluído', progress: 25 });

    sendEvent('progress', { stage: 'copywriter', message: '✍️ Iniciando agente COPYWRITER...', progress: 30 });
    const copywriterResult = await callGeminiAgent('copywriter', JSON.stringify(roteiristaResult), request);
    sendEvent('progress', { stage: 'copywriter', message: '✅ Copywriter concluído', progress: 50 });

    sendEvent('progress', { stage: 'editor', message: '📝 Iniciando agente EDITOR...', progress: 55 });
    const editorResult = await callGeminiAgent('editor', JSON.stringify(copywriterResult), request);
    sendEvent('progress', { stage: 'editor', message: '✅ Editor concluído', progress: 75 });

    sendEvent('progress', { stage: 'supervisor', message: '🔍 Iniciando agente SUPERVISOR...', progress: 80 });
    const supervisorResult = await callGeminiAgent('supervisor', JSON.stringify(editorResult), request);
    sendEvent('progress', { stage: 'supervisor', message: '✅ Supervisor concluído', progress: 90 });

    // Processar resultado final
    const slides = supervisorResult.slides || [];
    const targetSlides = Math.max(Math.min(request.slideCount, 12), 4);
    
    if (slides.length < targetSlides) {
      for (let i = slides.length; i < targetSlides; i++) {
        slides.push({
          title: `SLIDE ${i + 1}`,
          subtitle: `Conteúdo sobre ${request.topic}`,
          body: [`Ponto ${i + 1} sobre o tema`, "Desenvolva este tópico", "Conecte com o próximo slide"]
        });
      }
    } else if (slides.length > targetSlides) {
      slides.splice(targetSlides);
    }

    if (slides.length > 0) {
      const lastSlide = slides[slides.length - 1];
      if (!lastSlide.body.some(line => line.toLowerCase().includes('acesse') || 
                                     line.toLowerCase().includes('clique') ||
                                     line.toLowerCase().includes('saiba mais') ||
                                     line.toLowerCase().includes('confira'))) {
        lastSlide.body.push("👆 Acesse o link para saber mais!");
      }
    }

    sendEvent('complete', {
      success: true,
      slides,
      progress: 100,
      message: `🎯 Pipeline concluído: ${slides.length} slides gerados`
    });

  } catch (error) {
    sendEvent('error', {
      success: false,
      error: error.message,
      message: `❌ Erro no pipeline: ${error.message}`
    });
  } finally {
    controller.close();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isStreaming = url.searchParams.get('stream') === 'true';
    const request: GenerationRequest = await req.json();
    
    console.log('📥 Nova solicitação de geração:', {
      topic: request.topic,
      slideCount: request.slideCount,
      intention: request.intention,
      streaming: isStreaming
    });

    // Validação básica
    if (!request.topic?.trim()) {
      throw new Error('Tema é obrigatório');
    }

    if (isStreaming) {
      // Implementar streaming SSE
      const stream = new ReadableStream({
        start(controller) {
          generateWithStreamingPipeline(request, controller);
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Executar pipeline normal
      const result = await generateWithAgentPipeline(request);
      
      console.log('📤 Resultado da geração:', {
        success: result.success,
        slidesCount: result.slides?.length || 0,
        logs: result.agent_logs?.length || 0
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('❌ Erro na função generate-carousel-content:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      agent_logs: [`Erro: ${error.message}`]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});