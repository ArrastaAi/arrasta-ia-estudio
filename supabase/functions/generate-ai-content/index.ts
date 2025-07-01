
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
    console.log('Solicitação N8N recebida:', requestData);

    // Usar a URL do webhook N8N configurada
    const n8nWebhookUrl = 'https://n8n-n8n-start.0v0jjw.easypanel.host/webhook-test/thread';
    
    if (!n8nWebhookUrl) {
      throw new Error('URL do webhook N8N não configurada no servidor');
    }

    // Chamar N8N webhook com dados estruturados
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: requestData.topic || '',
        audience: requestData.audience || 'Público geral',
        intention: requestData.intention || 'educar',
        slideCount: Math.min(requestData.slideCount || 5, 12), // Máximo 12 slides
        context: requestData.context || '',
        timestamp: new Date().toISOString(),
        source: 'carousel-generator'
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao chamar N8N: ${response.status}`);
    }

    const n8nResult = await response.json();
    console.log('Resposta do N8N:', n8nResult);

    // Processar resposta do N8N para formato esperado
    let parsedTexts: GeneratedText[] = [];
    
    if (n8nResult.slides && Array.isArray(n8nResult.slides)) {
      parsedTexts = n8nResult.slides.slice(0, 12).map((text: string, index: number) => ({
        id: index + 1,
        text: text.trim()
      }));
    } else if (n8nResult.content) {
      // Fallback: dividir conteúdo em slides
      const lines = n8nResult.content.split('\n').filter((line: string) => line.trim());
      parsedTexts = lines.slice(0, 12).map((text: string, index: number) => ({
        id: index + 1,
        text: text.trim()
      }));
    }

    // Garantir pelo menos alguns slides se N8N não retornar nada
    if (parsedTexts.length === 0) {
      const slideCount = Math.min(requestData.slideCount || 5, 12);
      parsedTexts = Array.from({ length: slideCount }, (_, i) => ({
        id: i + 1,
        text: `Slide ${i + 1}: Conteúdo sobre ${requestData.topic || 'o tema solicitado'}`
      }));
    }

    console.log(`Processamento concluído: ${parsedTexts.length} slides gerados`);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText: n8nResult.content || 'Conteúdo gerado via N8N',
        parsedTexts: parsedTexts,
        source: 'n8n-webhook',
        slidesGenerated: parsedTexts.length
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
