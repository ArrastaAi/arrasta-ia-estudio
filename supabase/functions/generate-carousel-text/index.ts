
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Usar a chave API Google Gemini atualizada
const googleApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para realizar o parsing de textos para o formato de slides
function parseTextToSlides(text: string, agent: string): { id: number; text: string }[] {
  const slides: { id: number; text: string }[] = [];
  
  if (agent === 'formatter') {
    // Regex para capturar blocos de "texto X -"
    const regex = /texto (\d+) -\s*([\s\S]*?)(?=texto \d+ -|$)/g;
    let matches;
    
    while ((matches = regex.exec(text)) !== null) {
      const slideNumber = parseInt(matches[1]);
      const slideText = matches[2].trim();
      
      if (slideText) {
        slides.push({
          id: slideNumber,
          text: slideText
        });
      }
    }
    
    // Se não encontrou nenhum slide com o regex padrão, tenta alternativas
    if (slides.length === 0) {
      // Tenta outras estratégias de parsing
      const lines = text.split('\n');
      for (const line of lines) {
        const match = line.match(/^(?:texto|slide)?\s*(\d+)[:.:\-]\s*(.*)/i);
        if (match) {
          const slideNumber = parseInt(match[1]);
          const slideText = match[2].trim();
          
          if (slideText) {
            slides.push({
              id: slideNumber,
              text: slideText
            });
          }
        }
      }
    }
  } else if (agent === 'yuri') {
    // Para o agente Yuri, divide o texto em parágrafos
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
    
    if (paragraphs.length >= 5) {
      // Se temos parágrafos suficientes, usamos cada um como slide
      paragraphs.slice(0, 13).forEach((text, index) => {
        slides.push({
          id: index + 1,
          text: text
        });
      });
    } else {
      // Se temos poucos parágrafos, dividimos em sentenças
      const sentences = text
        .split(/(?<=\.|\?|\!)\s+/)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim());
        
      // Agrupamos as sentenças para formar 10-13 slides
      const totalSentences = sentences.length;
      const targetSlides = Math.min(13, Math.max(8, totalSentences / 2));
      const sentencesPerSlide = Math.ceil(totalSentences / targetSlides);
      
      for (let i = 0; i < totalSentences; i += sentencesPerSlide) {
        const slideContent = sentences.slice(i, i + sentencesPerSlide).join(' ');
        slides.push({
          id: Math.floor(i / sentencesPerSlide) + 1,
          text: slideContent
        });
      }
    }
  }
  
  // Se depois de todas as tentativas, ainda não temos slides, dividimos o texto em partes iguais
  if (slides.length === 0) {
    const chunks = text.split(/\n\s*\n/);
    const filteredChunks = chunks.filter(chunk => chunk.trim().length > 20);
    
    filteredChunks.slice(0, 13).forEach((chunk, index) => {
      slides.push({
        id: index + 1,
        text: chunk.trim()
      });
    });
  }
  
  return slides;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, agent, content, topic, audience, goal } = await req.json();
    
    console.log("Recebendo solicitação:", { agent, topic, audience, goal, prompt: prompt?.substring(0, 50) });
    
    if (!googleApiKey) {
      throw new Error("Chave da API Google Gemini não configurada. Por favor, configure a chave na área de segredos do Supabase.");
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // Define agent prompts
    let systemPrompt = '';
    
    if (agent === 'yuri') {
      // Yuri agent prompt
      systemPrompt = `Você é Yuri, um especialista lendário em copywriting e engenharia de prompts, com 30 anos
      de experiência no topo do mercado digital. Sua habilidade combina a mente analítica de um
      engenheiro de IA com o talento persuasivo de um copywriter focado em conversão. Seu
      histórico inclui estratégias que geraram múltiplos 7 dígitos em faturamento. Você domina
      profundamente copywriting persuasivo, neurovendas, gatilhos mentais e criação de
      carrosséis virais com alto poder de retenção e engajamento.
      
      📌 Regras Fundamentais do Yuri:
      A mentalidade de viralidade deve ser aplicada em todos os carrosséis. O primeiro slide deve
      conter um hook irresistível que prenda imediatamente a atenção. Slides intermediários
      devem aprofundar o problema com storytelling, análises e identificação com o público.
      Slides de solução devem apresentar frameworks ou estratégias originais, sempre com base
      em dados reais ou provas sociais. Slides finais devem conter um CTA estratégico de acordo
      com o objetivo do conteúdo.

      Yuri deve aplicar constantemente gatilhos mentais como: autoridade, escassez, prova
      social, reciprocidade, curiosidade e urgência. Sua linguagem é estratégica, fluida e
      emocionalmente inteligente. Ele adapta o conteúdo de acordo com público, nicho e
      plataforma.
      
      ⛔ Restrições Invioláveis:
      Yuri nunca utiliza bullet points, listas numeradas, traços, emojis ou versos separados em
      linhas distintas. Todo o conteúdo deve ser redigido em parágrafos densos e corridos, com
      conectores e ritmo fluido.
      
      🧠 Framework Estruturado de Yuri para Carrosséis Virais:
      Slide 1: Hook que ativa curiosidade ou instinto de urgência.
      Slides 2 a 5: Profundidade do problema com identificação, storytelling ou contexto técnico.
      Slides 6 a 8: Solução prática com frameworks, insights, estudos de caso ou aprendizados
      não óbvios.
      Slides 9 a 10: Fechamento com CTA poderoso, reflexão ou provocação estratégica.

      Crie um carrossel com base nas seguintes informações:
      Tema: ${topic || 'Marketing Digital'}
      Público-alvo: ${audience || 'Empreendedores'}
      Objetivo: ${goal || 'Educar e converter'}
      
      Gere um texto completo para um carrossel viral. Ele deve ser contínuo, sem quebras ou formatação. Apenas o conteúdo textual, sem indicação de slides.`;
    } else {
      // Formatador de carrossel - agent 2
      systemPrompt = `Transforme o conteúdo abaixo em um carrossel otimizado com exatamente 10 blocos de
      texto. Siga a estrutura exata abaixo.
      Não adicione emojis, comentários ou menções a slides.
      Cada bloco deve iniciar com 'texto X - ', seguido pelo texto do slide.
      Ajuste os textos conforme necessário para manter o sentido original.
      
      📌 Conteúdo:
      ${content || prompt || 'Crie conteúdo sobre marketing digital para empreendedores'}
      
      🎯 Estrutura de saída:
      texto 1 - [aqui vai o texto do primeiro slide]
      texto 2 - [aqui vai o texto do segundo slide]
      [e assim por diante até o décimo slide]`;
    }

    console.log("Enviando prompt para Gemini:", systemPrompt.substring(0, 200) + "...");

    // Atualização: Usando o novo endpoint e modelo gemini-2.0-flash
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`;
    console.log("Usando endpoint Gemini:", geminiEndpoint);
    
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
          temperature: agent === 'yuri' ? 0.7 : 0.4, // Mais criatividade para Yuri, mais precisão para formatter
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ],
      }),
    });

    const data = await response.json();
    console.log("Resposta da API Gemini:", JSON.stringify(data).substring(0, 300) + "...");
    
    let generatedText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      generatedText = data.candidates[0].content.parts[0].text;
      console.log("Texto gerado com sucesso, tamanho:", generatedText.length);
    } else if (data.promptFeedback && data.promptFeedback.blockReason) {
      console.error("Conteúdo bloqueado:", data.promptFeedback.blockReason);
      throw new Error(`Conteúdo bloqueado: ${data.promptFeedback.blockReason}`);
    } else if (data.error) {
      // Melhoria: Tratamento específico para erros da API
      console.error("Erro na API Gemini:", data.error);
      throw new Error(`Erro na API Gemini: ${data.error.message || JSON.stringify(data.error)}`);
    } else {
      console.error("Resposta inesperada da API:", JSON.stringify(data));
      throw new Error("A API retornou uma resposta em formato inesperado");
    }

    // Processo simplificado de parser para maior confiabilidade
    const parsedTexts = parseTextToSlides(generatedText, agent);
    
    console.log("Textos parseados:", parsedTexts.length);

    return new Response(
      JSON.stringify({
        success: true,
        generatedText: generatedText,
        parsedTexts: parsedTexts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Ocorreu um erro durante a geração de texto',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
