
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedText {
  id: number;
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Solicitação N8N recebida:', JSON.stringify(requestData, null, 2));

    // URL corrigida do webhook N8N
    const n8nWebhookUrl = 'https://n8n-n8n-start.0v0jjw.easypanel.host/webhook/thread';
    
    console.log('Chamando N8N webhook:', n8nWebhookUrl);
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

    // Dados estruturados para envio ao N8N
    const n8nPayload = {
      topic: requestData.topic || '',
      audience: requestData.audience || 'Público geral',
      intention: requestData.intention || 'educar',
      slideCount: Math.min(Math.max(requestData.slideCount || 5, 4), 12), // Entre 4 e 12 slides
      context: requestData.context || '',
      timestamp: new Date().toISOString(),
      source: 'carousel-generator'
    };

    console.log('Payload enviado ao N8N:', n8nPayload);

    // Chamar N8N webhook
    console.log('Enviando requisição para N8N...');
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function',
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('Resposta N8N - Status:', response.status);
    console.log('Resposta N8N - Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro N8N:', errorText);
      throw new Error(`Erro ao chamar N8N: ${response.status} - ${errorText}`);
    }

    const n8nResult = await response.json();
    console.log('Resposta N8N - Dados:', n8nResult);

    // Processar resposta do N8N
    let parsedTexts: GeneratedText[] = [];
    
    if (n8nResult.slides && Array.isArray(n8nResult.slides)) {
      // Resposta com slides estruturados
      parsedTexts = n8nResult.slides.slice(0, 12).map((text: string, index: number) => ({
        id: index + 1,
        text: text.trim()
      }));
    } else if (n8nResult.content) {
      // Resposta com conteúdo textual - dividir em slides
      const lines = n8nResult.content.split('\n').filter((line: string) => line.trim());
      parsedTexts = lines.slice(0, 12).map((text: string, index: number) => ({
        id: index + 1,
        text: text.trim()
      }));
    } else if (typeof n8nResult === 'string') {
      // Resposta como string simples
      const lines = n8nResult.split('\n').filter((line: string) => line.trim());
      parsedTexts = lines.slice(0, 12).map((text: string, index: number) => ({
        id: index + 1,
        text: text.trim()
      }));
    }

    // Garantir pelo menos o número mínimo de slides
    const minSlides = Math.max(requestData.slideCount || 5, 4);
    if (parsedTexts.length < minSlides) {
      const slidesToAdd = minSlides - parsedTexts.length;
      for (let i = 0; i < slidesToAdd; i++) {
        parsedTexts.push({
          id: parsedTexts.length + 1,
          text: `Slide ${parsedTexts.length + 1}: Conteúdo sobre ${requestData.topic || 'o tema solicitado'}`
        });
      }
    }

    console.log(`Processamento concluído: ${parsedTexts.length} slides gerados`);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText: n8nResult.content || n8nResult || 'Conteúdo gerado via N8N',
        parsedTexts: parsedTexts,
        source: 'n8n-webhook',
        slidesGenerated: parsedTexts.length,
        webhookUrl: n8nWebhookUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na função generate-ai-content:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
