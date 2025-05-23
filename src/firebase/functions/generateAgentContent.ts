
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GenerateAgentContentParams {
  agent: string;
  prompt?: string;
  topic?: string;
  audience?: string;
  goal?: string;
  content?: string;
  apiKey: string;
  slideCount: number;
  format: {
    slideCounts: number;
    wordLimits: number[];
  };
  onlyCorrectSpelling?: boolean;
  maxSlidesAllowed?: number;
}

interface GeneratedText {
  id: number;
  text: string;
}

interface GenerateAgentContentResult {
  success: boolean;
  generatedText?: string;
  parsedTexts?: GeneratedText[];
  error?: string;
}

export async function generateAgentContent(params: GenerateAgentContentParams): Promise<GenerateAgentContentResult> {
  try {
    const {
      agent,
      prompt,
      topic,
      audience,
      goal,
      content,
      apiKey,
      slideCount,
      format,
      onlyCorrectSpelling = false,
      maxSlidesAllowed = 9
    } = params;

    console.log("Inicializando Google Generative AI com a chave:", apiKey ? "***" : "não fornecida");

    if (!apiKey) {
      throw new Error("Chave da API não fornecida");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let systemPrompt = "";
    let userPrompt = "";

    if (agent === "yuri") {
      systemPrompt = `Você é Yuri, um especialista em copywriting viral para carrosséis no Instagram. 
      Sua missão é criar textos persuasivos que engajam e convertem.
      
      REGRAS IMPORTANTES:
      - Crie exatamente ${slideCount} slides
      - Máximo de ${format.wordLimits[0] || 20} palavras por slide
      - Use linguagem direta e impactante
      - Foque na conversão e engajamento
      - Termine sempre com CTA forte
      
      FORMATO DE RESPOSTA:
      Slide 1: [texto]
      Slide 2: [texto]
      Slide 3: [texto]
      (continue até slide ${slideCount})`;

      userPrompt = `Crie um carrossel sobre: ${topic}
      Público-alvo: ${audience || "geral"}
      Objetivo: ${goal || "educar"}
      ${prompt ? `Instruções extras: ${prompt}` : ""}`;
    } else if (agent === "formatter") {
      if (onlyCorrectSpelling) {
        systemPrompt = `Você é um corretor ortográfico especializado. 
        Corrija apenas erros de:
        - Ortografia
        - Gramática
        - Pontuação
        
        NÃO altere:
        - O conteúdo original
        - O estilo de escrita
        - A estrutura do texto
        
        FORMATO DE RESPOSTA:
        Slide 1: [texto corrigido]
        Slide 2: [texto corrigido]
        (continue conforme necessário)`;
        
        userPrompt = `Corrija apenas a ortografia deste texto: ${content}`;
      } else {
        systemPrompt = `Você é um formatador de textos especializado em carrosséis. 
        Transforme qualquer texto em slides otimizados.
        
        REGRAS:
        - Crie entre 3 a ${Math.min(slideCount, maxSlidesAllowed)} slides
        - Máximo de ${format.wordLimits[0] || 25} palavras por slide
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
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log("Enviando prompt para o Gemini:", fullPrompt.substring(0, 200) + "...");

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedText = response.text();

    console.log("Resposta do Gemini recebida:", generatedText.substring(0, 200) + "...");

    // Parse the generated text into slides
    const parsedTexts = parseResponseToSlides(generatedText, maxSlidesAllowed);

    return {
      success: true,
      generatedText,
      parsedTexts
    };

  } catch (error: any) {
    console.error("Erro na geração de conteúdo:", error);
    return {
      success: false,
      error: error.message || "Erro interno do servidor"
    };
  }
}

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
