
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseRawText } from "./textParser";

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
        setParsedTexts(parsedData);
        
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
      
      // Validating input data
      if (activeAgent === 'yuri' && !formData.topic) {
        throw new Error("Por favor, informe o tema do carrossel");
      }
      
      if (activeAgent === 'formatter' && !formData.content) {
        throw new Error("Por favor, informe o conteúdo a ser formatado");
      }
      
      // Log for debugging
      console.log("Enviando solicitação para generate-carousel-text:", {
        agent: activeAgent,
        prompt: formData.prompt,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
      });
      
      const { data, error } = await supabase.functions.invoke("generate-carousel-text", {
        body: {
          agent: activeAgent,
          prompt: formData.prompt,
          topic: formData.topic,
          audience: formData.audience,
          goal: formData.goal,
          content: formData.content,
        },
      });

      console.log("Resposta da função generate-carousel-text:", data, error);

      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message || "Erro ao chamar a função");
      }
      
      if (!data) {
        throw new Error("Nenhum dado retornado da função");
      }
      
      if (data.success) {
        setRawGeneratedText(data.generatedText || "");
        
        if (data.parsedTexts && Array.isArray(data.parsedTexts) && data.parsedTexts.length > 0) {
          setParsedTexts(data.parsedTexts);
          toast({
            title: "Sucesso!",
            description: `${data.parsedTexts.length} slides foram gerados com sucesso.`,
          });
        } else {
          console.error("Textos parseados ausentes ou inválidos:", data.parsedTexts);
          // Como fallback, tentamos analisar o texto bruto
          try {
            const textosParsedManualmente = parseRawText(data.generatedText || "");
            if (textosParsedManualmente.length > 0) {
              setParsedTexts(textosParsedManualmente);
              toast({
                title: "Sucesso!",
                description: `${textosParsedManualmente.length} slides foram gerados com sucesso.`,
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
    
    onApplyTexts(parsedTexts);
    toast({
      title: "Textos aplicados",
      description: "Os textos foram aplicados com sucesso aos slides",
    });
  };

  const clearGeneratedTexts = () => {
    setParsedTexts([]);
    setRawGeneratedText("");
    localStorage.removeItem("generatedCarouselTexts");
    localStorage.removeItem("generatedRawText");
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
