
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getAPIKeyForAgent } from './api-keys.ts';
import { tryGenerateWithKey } from './gemini-client.ts';
import { parseResponseToSlidesAdvanced } from './response-parser.ts';

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
