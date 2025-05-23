
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// API keys from environment variables
const googleApiKey = Deno.env.get("TEXT_STRUCTURE_API_KEY") || "";
const fallbackApiKey = Deno.env.get("FALLBACK_API_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideWordCount {
  slideIndex: number; // 1-based
  wordCount: number;
  fontFamily: string;
}

interface SlideContent {
  id: number;
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Check if this is just an API key check request
    if (requestData && requestData.checkApiKeyOnly === true) {
      const hasApiKey = !!(googleApiKey || fallbackApiKey);
      return new Response(
        JSON.stringify({
          success: hasApiKey,
          apiKeyMissing: !hasApiKey
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { content, slideCount, wordCountRules, publicationType } = requestData;
    
    console.log("Received request for structured content generation:", { 
      slideCount, 
      contentLength: content?.length || 0,
      publicationType,
      hasWordCountRules: !!wordCountRules && wordCountRules.length > 0
    });
    
    if (!googleApiKey && !fallbackApiKey) {
      throw new Error("API keys are not configured. Please set TEXT_STRUCTURE_API_KEY or FALLBACK_API_KEY in the Supabase Edge Function Secrets.");
    }
    
    // Definição das regras de contagem de palavras exatas conforme o prompt
    const exactWordCounts: SlideWordCount[] = [
      { slideIndex: 1, wordCount: 6, fontFamily: "Fixture" },
      { slideIndex: 1, wordCount: 11, fontFamily: "Helvetica Now Display" },
      { slideIndex: 2, wordCount: 22, fontFamily: "Helvetica Now Display" },
      { slideIndex: 2, wordCount: 19, fontFamily: "Fixture" },
      { slideIndex: 3, wordCount: 68, fontFamily: "Helvetica Now Display" },
      { slideIndex: 3, wordCount: 11, fontFamily: "Fixture" },
      { slideIndex: 4, wordCount: 36, fontFamily: "Helvetica Now Display" },
      { slideIndex: 4, wordCount: 49, fontFamily: "Helvetica Now Display" },
      { slideIndex: 5, wordCount: 15, fontFamily: "Fixture" },
      { slideIndex: 5, wordCount: 41, fontFamily: "Helvetica Now Display" },
      { slideIndex: 6, wordCount: 18, fontFamily: "Fixture" },
      { slideIndex: 6, wordCount: 54, fontFamily: "Fixture" },
      { slideIndex: 7, wordCount: 21, fontFamily: "Helvetica Now Display" },
    ];
    
    // Usar as regras fornecidas ou as padrão, sempre limitando ao número de slides (máx 9)
    const actualWordCounts = wordCountRules || exactWordCounts;
    
    // Garantir que não ultrapasse o limite de 9 slides
    const actualSlideCount = Math.min(slideCount || 9, 9);
    
    // Determine the publication style for content formatting
    let publicationStyle = publicationType || "magazine";
    
    // Prepare the prompt for the API
    const systemPrompt = `Você é um criador de conteúdo profissional especializado em carrosséis para mídias sociais no estilo ${publicationStyle}. 
    Sua tarefa é transformar o conteúdo fornecido em exatamente ${actualSlideCount} blocos de texto para um carrossel em português brasileiro.
    
    Cada bloco de texto deve seguir estas regras específicas de contagem de palavras:
    ${actualWordCounts.map(rule => `- Slide ${rule.slideIndex}, Fonte: ${rule.fontFamily}: ${rule.wordCount} palavras (±2 palavras)`).join('\n')}
    
    Regras:
    1. Cada bloco de texto deve ser coerente, claro e manter a integridade do conteúdo original.
    2. Não use emojis, marcadores ou qualquer formatação especial.
    3. Mantenha os blocos concisos e siga a especificação de contagem de palavras o mais próximo possível.
    4. Se vários blocos estiverem atribuídos ao mesmo número de slide, certifique-se de que eles se complementem.
    5. O tom deve ser profissional e envolvente.
    6. Para o estilo ${publicationStyle}, use padrões de linguagem e estrutura apropriados.
    7. Escreva em português brasileiro formal, mas acessível.
    8. Mantenha a coerência narrativa entre os slides, como se contasse uma história.
    9. Adapte o vocabulário para o contexto de apresentações e carrosséis para redes sociais.
    10. Certifique-se que o texto flua naturalmente entre os slides.
    11. IMPORTANTE: Nunca ultrapasse o limite de ${actualSlideCount} slides, mesmo que o conteúdo seja extenso.
    
    Formate sua resposta como JSON com esta estrutura:
    {
      "blocks": [
        {"slideIndex": 1, "text": "Seu texto para o slide 1", "fontFamily": "Fixture", "wordCount": 6},
        {"slideIndex": 1, "text": "Sua segunda parte do texto para o slide 1", "fontFamily": "Helvetica Now Display", "wordCount": 11},
        ...
      ]
    }
    
    Conteúdo original para transformar:
    ${content}`;

    const apiKey = googleApiKey || fallbackApiKey;
    
    // Call Google's Gemini API to generate the structured content
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
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
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();
    console.log("API response structure:", Object.keys(data));
    
    let structuredContent: SlideContent[] = [];
    
    // Parse the API response to extract the generated content
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log("Raw response text:", responseText.substring(0, 150) + "...");
      
      // Extract JSON from the response
      try {
        // Find JSON in the response (it might be embedded in other text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          
          if (jsonResponse.blocks && Array.isArray(jsonResponse.blocks)) {
            // Convert the blocks to our SlideContent format
            structuredContent = jsonResponse.blocks.map((block: any, index: number) => ({
              id: block.slideIndex || index + 1,
              text: block.text || ""
            }));
            
            // Limitar o número máximo de slides para 9
            structuredContent = structuredContent.slice(0, 9);
            
            console.log(`Successfully parsed ${structuredContent.length} structured blocks`);
          }
        } else {
          throw new Error("Could not find JSON in the response");
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        
        // Fallback: Try to parse as plain text if JSON parsing fails
        const blocks = responseText.split(/\n\s*\n/).filter(block => block.trim().length > 0);
        
        if (blocks.length > 0) {
          structuredContent = blocks.slice(0, actualSlideCount).map((block, index) => ({
            id: index + 1,
            text: block.replace(/^(Slide|Block|Text)\s*\d+[\s\-:]*/i, '').trim()
          }));
          
          console.log(`Fallback: Created ${structuredContent.length} text blocks from plain text`);
        }
      }
    } else if (data.error) {
      console.error("API error:", data.error);
      throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    // If we still don't have structured content, create default content
    if (structuredContent.length === 0) {
      console.log("Creating default structured content");
      structuredContent = Array.from({length: actualSlideCount}, (_, i) => ({
        id: i + 1,
        text: `Conteúdo para o slide ${i + 1} com tamanho apropriado baseado nos requisitos de design.`
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        structuredContent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-structured-content function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Ocorreu um erro durante a geração de conteúdo estruturado',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
