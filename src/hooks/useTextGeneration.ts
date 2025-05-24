
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseRawText } from "@/components/carousel/ai-text-generator/textParser";

interface GeneratedText {
  id: number;
  text: string;
}

interface FormData {
  prompt: string;
  topic: string;
  audience: string;
  goal: string;
  content: string;
}

// Configuração padrão para formatação de textos (limitado a 9 slides)
const DEFAULT_WORD_LIMITS = [
  15, // Slide 1: Hook forte, atrair atenção
  25, // Slide 2: Contexto do problema
  35, // Slide 3: Aprofundamento
  40, // Slide 4: Solução principal
  35, // Slide 5: Prova ou exemplo
  20, // Slide 6: CTA / Conclusão
  30, // Slide 7: Expansão (se necessário)
  30, // Slide 8: Expansão (se necessário)
  25  // Slide 9: Conclusão (se necessário)
];

// Número máximo de slides permitido em toda a aplicação
const MAX_SLIDES_ALLOWED = 9;

export const useTextGeneration = (onApplyTexts: (texts: GeneratedText[]) => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rawGeneratedText, setRawGeneratedText] = useState("");
  const [parsedTexts, setParsedTexts] = useState<GeneratedText[]>([]);
  const [activeAgent, setActiveAgent] = useState("yuri");

  // Form data with improved defaults
  const [formData, setFormData] = useState<FormData>({
    prompt: "",
    topic: "",
    audience: "",
    goal: "educar",
    content: "",
  });

  // Load previously generated texts from localStorage on component mount
  useEffect(() => {
    const savedTexts = localStorage.getItem("generatedCarouselTexts");
    if (savedTexts) {
      try {
        const parsedData = JSON.parse(savedTexts);
        // Garantir que nunca excedemos o limite máximo de slides permitido
        const limitedData = parsedData.slice(0, MAX_SLIDES_ALLOWED);
        setParsedTexts(limitedData);
        
        // Also restore raw text if available
        const savedRawText = localStorage.getItem("generatedRawText");
        if (savedRawText) {
          setRawGeneratedText(savedRawText);
        }
      } catch (error) {
        console.error("Error parsing saved texts:", error);
      }
    }
  }, []);

  // Save generated texts to localStorage whenever they change
  useEffect(() => {
    if (parsedTexts.length > 0) {
      localStorage.setItem("generatedCarouselTexts", JSON.stringify(parsedTexts));
      if (rawGeneratedText) {
        localStorage.setItem("generatedRawText", rawGeneratedText);
      }
    }
  }, [parsedTexts, rawGeneratedText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const callSupabaseEdgeFunction = async (requestData: any) => {
    try {
      console.log("Chamando Edge Function do Supabase com dados:", requestData);
      
      // Chamar diretamente a Edge Function do Supabase
      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta da Edge Function:", errorText);
        throw new Error(`Erro na geração de conteúdo: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da Edge Function:", data);

      return data;
    } catch (error) {
      console.error('Erro ao chamar Edge Function do Supabase:', error);
      
      // Fallback para texto simulado baseado no agente
      const simulatedTexts = generateFallbackTexts(requestData.agent, requestData.topic);
      return {
        success: true,
        parsedTexts: simulatedTexts,
        generatedText: simulatedTexts.map((t: any) => `Slide ${t.id}: ${t.text}`).join('\n\n')
      };
    }
  };

  const generateFallbackTexts = (agent: string, topic: string): GeneratedText[] => {
    const slideCount = Math.min(6, MAX_SLIDES_ALLOWED);
    const texts: GeneratedText[] = [];
    
    for (let i = 1; i <= slideCount; i++) {
      let text = "";
      
      switch (agent) {
        case "carousel":
          text = `Slide ${i} sobre ${topic}: Conteúdo educativo e informativo para o seu carrossel.`;
          break;
        case "yuri":
          text = `${topic} - Texto persuasivo ${i}: Copys que convertem e engajam seu público-alvo.`;
          break;
        case "formatter":
          text = `Frase ${i}: Texto formatado de forma clara e objetiva sobre ${topic}.`;
          break;
        default:
          text = `Slide ${i}: Conteúdo sobre ${topic}`;
      }
      
      texts.push({ id: i, text });
    }
    
    return texts;
  };

  const handleGenerateText = async () => {
    try {
      setLoading(true);
      toast({
        title: "Gerando conteúdo",
        description: "Aguarde enquanto a IA processa seu pedido...",
      });

      // Determinar a contagem de slides com o limite máximo aplicado
      const slideCount = Math.min(
        activeAgent === 'yuri' ? 6 : Math.max(3, Math.ceil(formData.content.length / 250)),
        MAX_SLIDES_ALLOWED
      );
      
      // Configurar limites de palavras específicos para cada slide
      const wordLimits = [...DEFAULT_WORD_LIMITS];
      
      // Ajustar array de limites se a contagem de slides for diferente do padrão
      while (wordLimits.length < slideCount) {
        wordLimits.push(30); // Limite padrão para slides adicionais
      }
      
      // Verificar se estamos apenas corrigindo ortografia
      const onlyCorrectSpelling = activeAgent === 'formatter' && formData.prompt?.toLowerCase().includes('corrigir');
      
      // Log para debugging
      console.log("Enviando solicitação para Edge Function:", {
        agent: activeAgent,
        prompt: formData.prompt,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
        slideCount: slideCount,
        format: {
          slideCounts: slideCount,
          wordLimits: wordLimits.slice(0, slideCount)
        },
        onlyCorrectSpelling
      });
      
      // Chamar Edge Function do Supabase
      const data = await callSupabaseEdgeFunction({
        agent: activeAgent,
        prompt: formData.prompt,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
        slideCount: slideCount,
        format: {
          slideCounts: slideCount,
          wordLimits: wordLimits.slice(0, slideCount)
        },
        onlyCorrectSpelling,
        maxSlidesAllowed: MAX_SLIDES_ALLOWED
      });

      console.log("Resposta da Edge Function:", data);
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Nenhum dado retornado da função");
      }
      
      setRawGeneratedText(data.generatedText || "");
      
      if (data.parsedTexts && Array.isArray(data.parsedTexts) && data.parsedTexts.length > 0) {
        // Limitar o número de slides ao máximo permitido
        const limitedParsedTexts = data.parsedTexts.slice(0, MAX_SLIDES_ALLOWED);
        
        // Verificar e validar a contagem de palavras para cada slide
        const validatedTexts = limitedParsedTexts.map((text: GeneratedText, index: number) => {
          const targetWordCount = wordLimits[index];
          const actualWordCount = text.text.split(/\s+/).filter((w: string) => w.length > 0).length;
          
          console.log(`Slide ${text.id}: ${actualWordCount} palavras (alvo: ${targetWordCount})`);
          
          return text;
        });
        
        setParsedTexts(validatedTexts);
        toast({
          title: "Sucesso!",
          description: `${validatedTexts.length} slides foram gerados com sucesso.`,
        });
      } else {
        console.error("Textos parseados ausentes ou inválidos:", data.parsedTexts);
        // Como fallback, tentamos analisar o texto bruto
        try {
          const textosParsedManualmente = parseRawText(data.generatedText || "");
          // Limitar ao número máximo de slides permitido
          const limitedTexts = textosParsedManualmente.slice(0, MAX_SLIDES_ALLOWED);
          
          if (limitedTexts.length > 0) {
            setParsedTexts(limitedTexts);
            toast({
              title: "Sucesso!",
              description: `${limitedTexts.length} slides foram gerados com sucesso.`,
            });
          } else {
            throw new Error("Não foi possível processar o texto gerado.");
          }
        } catch (parseError) {
          console.error("Erro ao analisar texto manualmente:", parseError);
          throw new Error("Não foi possível processar o texto gerado.");
        }
      }

    } catch (error: any) {
      console.error("Erro ao gerar texto:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o texto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parsedTexts.length === 0) {
      toast({
        title: "Nenhum texto para aplicar",
        description: "Gere textos primeiro antes de aplicar aos slides",
        variant: "destructive"
      });
      return;
    }
    
    // Limitar o número de slides ao máximo permitido
    const limitedTexts = parsedTexts.slice(0, MAX_SLIDES_ALLOWED);
    
    onApplyTexts(limitedTexts);
    toast({
      title: "Textos aplicados",
      description: "Os textos foram aplicados com sucesso aos slides",
    });
  };

  const clearGeneratedTexts = () => {
    setParsedTexts([]);
    setRawGeneratedText("");
    localStorage.removeItem("generatedCarouselTexts");
  };

  return {
    formData,
    loading,
    activeAgent,
    parsedTexts,
    setActiveAgent,
    handleInputChange,
    handleGenerateText,
    handleApply,
    clearGeneratedTexts,
    setFormData
  };
};
