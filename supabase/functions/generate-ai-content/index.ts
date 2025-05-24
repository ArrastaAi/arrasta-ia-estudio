
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
    const { agent, topic, audience, goal, content, prompt, slideCount } = requestData;
    
    console.log("Received request for AI content generation:", { 
      agent, 
      slideCount,
      topicLength: topic?.length || 0,
      contentLength: content?.length || 0
    });

    // Get API key from environment
    const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("API key não configurada no servidor");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Configure prompts based on agent type
    if (agent === "carousel") {
      systemPrompt = `Você é um especialista em criação de carrosséis para redes sociais. 
      Sua missão é criar carrosséis completos e envolventes que prendem a atenção do público.
      
      REGRAS IMPORTANTES:
      - Crie exatamente ${slideCount || 6} slides
      - Máximo de 25 palavras por slide
      - Use linguagem direta e impactante
      - Crie um fluxo narrativo entre os slides
      - Termine sempre com CTA forte
      
      FORMATO DE RESPOSTA:
      Slide 1: [texto]
      Slide 2: [texto]
      Slide 3: [texto]
      (continue até slide ${slideCount || 6})`;

      userPrompt = `Crie um carrossel sobre: ${topic}
      Público-alvo: ${audience || "geral"}
      Objetivo: ${goal || "educar"}
      ${prompt ? `Instruções extras: ${prompt}` : ""}`;
    } else if (agent === "yuri") {
      systemPrompt = `Você é Yuri, um especialista em copywriting viral para carrosséis no Instagram. 
      Sua missão é criar textos persuasivos que engajam e convertem.
      
      REGRAS IMPORTANTES:
      - Crie exatamente ${slideCount || 6} slides
      - Máximo de 20 palavras por slide
      - Use linguagem direta e impactante
      - Foque na conversão e engajamento
      - Termine sempre com CTA forte
      
      FORMATO DE RESPOSTA:
      Slide 1: [texto]
      Slide 2: [texto]
      Slide 3: [texto]
      (continue até slide ${slideCount || 6})`;

      userPrompt = `Crie um carrossel sobre: ${topic}
      Público-alvo: ${audience || "geral"}
      Objetivo: ${goal || "educar"}
      ${prompt ? `Instruções extras: ${prompt}` : ""}`;
    } else if (agent === "formatter") {
      systemPrompt = `Você é um formatador de textos especializado em carrosséis. 
      Transforme qualquer texto em slides otimizados.
      
      REGRAS:
      - Crie entre 3 a ${Math.min(slideCount || 6, 9)} slides
      - Máximo de 25 palavras por slide
      - Mantenha a essência do conteúdo original
      - Use linguagem clara e direta
      
      FORMATO DE RESPOSTA:
      Slide 1: [texto]
      Slide 2: [texto]
      Slide 3: [texto]
      (continue conforme necessário)`;

      userPrompt = `Formate este texto em slides: ${content}
      ${prompt ? `Instruções extras: ${prompt}` : ""}`;
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log("Sending prompt to Gemini API");

    // Call Gemini API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
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

    const data = await response.json();
    console.log("Gemini API response received");
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Extract generated text
    let generatedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      generatedText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Resposta inválida da API");
    }

    console.log("Generated text received:", generatedText.substring(0, 200) + "...");

    // Parse the generated text into slides
    const parsedTexts = parseResponseToSlides(generatedText, Math.min(slideCount || 6, 9));

    return new Response(
      JSON.stringify({
        success: true,
        generatedText,
        parsedTexts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-ai-content function:', error);
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
  
  // Split by "Slide" pattern
  const slideMatches = text.match(/Slide\s*\d+:\s*(.+?)(?=Slide\s*\d+:|$)/gs);
  
  if (slideMatches) {
    slideMatches.forEach((match, index) => {
      if (index >= maxSlides) return;
      
      const content = match.replace(/Slide\s*\d+:\s*/, '').trim();
      if (content) {
        slides.push({
          id: index + 1,
          text: content
        });
      }
    });
  } else {
    // Fallback: split by lines and create slides
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      if (index >= maxSlides) return;
      
      const cleanLine = line.replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim();
      if (cleanLine) {
        slides.push({
          id: index + 1,
          text: cleanLine
        });
      }
    });
  }

  return slides.slice(0, maxSlides);
}
