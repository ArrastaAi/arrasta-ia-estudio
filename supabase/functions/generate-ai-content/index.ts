
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

    // Use the new API key provided by the user
    const apiKey = "AIzaSyBDmxNFfZs3OwBfrYuM8GvE48SIWDzH92w";
    
    if (!apiKey) {
      throw new Error("API key não configurada no servidor");
    }

    // Always generate 9 slides (maximum allowed)
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

    console.log("Sending prompt to Gemini 2.0 API");

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
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response received successfully");
    
    if (data.error) {
      console.error("Gemini API returned error:", data.error);
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Extract generated text
    let generatedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      generatedText = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Invalid API response structure:", JSON.stringify(data));
      throw new Error("Resposta inválida da API Gemini");
    }

    console.log("Generated text received:", generatedText.substring(0, 200) + "...");

    // Parse the generated text into exactly 9 slides
    const parsedTexts = parseResponseToSlides(generatedText, targetSlideCount);

    if (parsedTexts.length < targetSlideCount) {
      console.log(`Warning: Only ${parsedTexts.length} slides parsed, expected ${targetSlideCount}`);
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

    console.log(`Successfully generated ${finalTexts.length} slides`);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText,
        parsedTexts: finalTexts
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
  
  console.log("Parsing response text into slides...");
  
  // Try to match "Slide X:" pattern first
  const slideMatches = text.match(/Slide\s*(\d+):\s*([^\n]+?)(?=\s*Slide\s*\d+:|$)/gs);
  
  if (slideMatches && slideMatches.length > 0) {
    console.log(`Found ${slideMatches.length} slides using Slide pattern`);
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
    console.log("No Slide pattern found, trying line-by-line parsing");
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

  console.log(`Successfully parsed ${slides.length} slides`);
  return slides.slice(0, maxSlides);
}
