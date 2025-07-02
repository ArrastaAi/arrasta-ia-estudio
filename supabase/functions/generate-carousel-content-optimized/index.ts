import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  topic: string;
  audience: string;
  intention: string;
  slideCount: number;
  context: string;
  ctaType: string;
  user_id?: string;
}

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: RequestData = await req.json();
    const { topic, audience, intention, slideCount, context, ctaType, user_id } = requestData;

    // Gerar cache key dos parâmetros
    const cacheKey = await generateCacheKey(requestData);

    // Verificar cache existente primeiro
    if (user_id) {
      const cachedResult = await checkExistingCache(supabase, user_id, cacheKey);
      if (cachedResult) {
        console.log('🎯 Cache hit - retornando resultado salvo');
        return new Response(
          JSON.stringify({
            success: true,
            slides: cachedResult,
            cached: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('🚀 Gerando novo conteúdo...');
    const startTime = Date.now();

    // Streaming response se solicitado
    const isStreaming = new URL(req.url).searchParams.get('stream') === 'true';
    
    if (isStreaming) {
      return handleStreamingRequest(supabase, requestData, cacheKey, user_id);
    }

    // Gerar conteúdo usando APIs externas
    const slides = await generateContent(requestData);
    const generationTime = (Date.now() - startTime) / 1000;

    // Salvar no cache para futuras consultas
    if (user_id && slides.length > 0) {
      await saveToCache(supabase, user_id, cacheKey, requestData, slides, generationTime);
    }

    return new Response(
      JSON.stringify({
        success: true,
        slides,
        generation_time: generationTime,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro na edge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateCacheKey(params: RequestData): Promise<string> {
  const { user_id, ...cacheParams } = params;
  const sortedParams = Object.keys(cacheParams)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = (cacheParams as any)[key];
      return result;
    }, {});
  
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(sortedParams));
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkExistingCache(
  supabase: any, 
  userId: string, 
  cacheKey: string
): Promise<SlideContent[] | null> {
  try {
    const { data, error } = await supabase
      .from('ai_generation_cache')
      .select('results')
      .eq('user_id', userId)
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data.results?.slides || null;
  } catch {
    return null;
  }
}

async function saveToCache(
  supabase: any,
  userId: string,
  cacheKey: string,
  parameters: RequestData,
  results: SlideContent[],
  generationTime: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await supabase
      .from('ai_generation_cache')
      .upsert({
        user_id: userId,
        cache_key: cacheKey,
        parameters,
        results: { slides: results },
        generation_time: generationTime,
        expires_at: expiresAt
      });
  } catch (error) {
    console.error('Erro ao salvar no cache:', error);
  }
}

async function handleStreamingRequest(
  supabase: any,
  requestData: RequestData,
  cacheKey: string,
  userId?: string
): Promise<Response> {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
  });

  // Processar em background
  (async () => {
    try {
      const startTime = Date.now();

      // Enviar progresso inicial
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({
          stage: "Inicializando",
          message: "Preparando agentes especializados...",
          progress: 10
        })}\n\n`
      ));

      // Simular etapas de geração
      const stages = [
        { stage: "Roteirista", message: "Estruturando narrativa...", progress: 25 },
        { stage: "Copywriter", message: "Criando textos persuasivos...", progress: 50 },
        { stage: "Editor", message: "Refinando conteúdo...", progress: 75 },
        { stage: "Supervisor", message: "Revisão final...", progress: 90 }
      ];

      for (const stageInfo of stages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify(stageInfo)}\n\n`
        ));
      }

      // Gerar conteúdo real
      const slides = await generateContent(requestData);
      const generationTime = (Date.now() - startTime) / 1000;

      // Salvar no cache
      if (userId && slides.length > 0) {
        await saveToCache(supabase, userId, cacheKey, requestData, slides, generationTime);
      }

      // Enviar resultado final
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({
          success: true,
          slides,
          generation_time: generationTime
        })}\n\n`
      ));

      controller.close();
    } catch (error) {
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({
          success: false,
          error: error.message
        })}\n\n`
      ));
      controller.close();
    }
  })();

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

async function generateContent(params: RequestData): Promise<SlideContent[]> {
  const { topic, audience, intention, slideCount, context, ctaType } = params;
  
  // Simular geração de conteúdo (substituir pela lógica real)
  const slides: SlideContent[] = [];
  
  for (let i = 0; i < slideCount; i++) {
    const isFirstSlide = i === 0;
    const isLastSlide = i === slideCount - 1;
    
    if (isFirstSlide) {
      slides.push({
        title: `${topic}`,
        subtitle: `Guia completo para ${audience.toLowerCase()}`,
        body: [`Descubra estratégias comprovadas`, `Resultados práticos e aplicáveis`]
      });
    } else if (isLastSlide && ctaType !== 'auto') {
      const ctaMessages = {
        curtir: 'Curta se você concorda! ❤️',
        comentar: 'Conte sua experiência nos comentários! 💬',
        marcar: 'Marque aquele amigo que precisa ver isso! 👥',
        compartilhar: 'Compartilhe para ajudar mais pessoas! 🔄'
      };
      
      slides.push({
        title: 'Obrigado!',
        subtitle: 'Gostou do conteúdo?',
        body: [ctaMessages[ctaType as keyof typeof ctaMessages] || 'Interaja com o post!']
      });
    } else {
      slides.push({
        title: `Ponto ${i}`,
        subtitle: `Aspecto importante sobre ${topic.toLowerCase()}`,
        body: [`Informação relevante ${i}`, `Dica prática para implementar`]
      });
    }
  }
  
  return slides;
}