import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseRawText } from "@/components/carousel/ai-text-generator/textParser";
import { useAPIKeyManager } from "@/hooks/useAPIKeyManager";
import { httpsCallable } from 'firebase/functions';
import { functions } from "@/integrations/firebase/client";

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
  const { getBestAvailableKey, incrementKeyUsage } = useAPIKeyManager();

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

  const handleGenerateText = async () => {
    try {
      setLoading(true);
      toast({
        title: "Gerando conteúdo",
        description: "Aguarde enquanto a IA processa seu pedido...",
      });

      
      // Obter a melhor chave disponível
      const apiKey = getBestAvailableKey();
      if (!apiKey) {
        toast({
          title: "Chave API não configurada",
          description: "Você precisa configurar uma chave API do Google Gemini para usar esta funcionalidade. Acesse a página de Configurações para adicionar uma chave.",
          variant: "destructive",
        });
        throw new Error("Nenhuma chave API disponível. Adicione uma chave em Configurações.");
      }
      
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
      console.log("Enviando solicitação para generate-agent-content:", {
        agent: activeAgent,
        prompt: formData.prompt,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
        apiKey: apiKey,
        slideCount: slideCount,
        format: {
          slideCounts: slideCount,
          wordLimits: wordLimits.slice(0, slideCount)
        },
        onlyCorrectSpelling
      });
      
      // Chamar a Cloud Function unificada
      const generateAgentContent = httpsCallable(functions, 'generateAgentContent');
      const result = await generateAgentContent({
        agent: activeAgent,
        prompt: formData.prompt,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
        apiKey: apiKey,
        slideCount: slideCount,
        format: {
          slideCounts: slideCount,
          wordLimits: wordLimits.slice(0, slideCount)
        },
        onlyCorrectSpelling,
        maxSlidesAllowed: MAX_SLIDES_ALLOWED
      });

      console.log("Resposta da função generate-agent-content:", result);

      const data = result.data as any;
      
      if (!data) {
        throw new Error("Nenhum dado retornado da função");
      }
      
      if (data.success) {
        // Incrementar o uso da chave API
        if (apiKey) {
          await incrementKeyUsage(apiKey);
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
      } else {
        throw new Error(data.error || "Falha ao gerar texto");
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
