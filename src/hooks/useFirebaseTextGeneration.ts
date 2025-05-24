
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseRawText } from "@/components/carousel/ai-text-generator/textParser";
import { useFirebaseAPIKeyManager } from "@/hooks/useFirebaseAPIKeyManager";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { db } from "@/integrations/firebase/client";
import { doc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";

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

// Número máximo de slides permitido em toda a aplicação
const MAX_SLIDES_ALLOWED = 9;

export const useFirebaseTextGeneration = (onApplyTexts: (texts: GeneratedText[]) => void) => {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [rawGeneratedText, setRawGeneratedText] = useState("");
  const [parsedTexts, setParsedTexts] = useState<GeneratedText[]>([]);
  const [activeAgent, setActiveAgent] = useState("carousel");
  const { getBestAvailableKey, incrementKeyUsage } = useFirebaseAPIKeyManager();

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
        const limitedData = parsedData.slice(0, MAX_SLIDES_ALLOWED);
        setParsedTexts(limitedData);
        
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

  const saveGeneratedTextToFirestore = async (texts: GeneratedText[], agent: string) => {
    if (!user) return;

    try {
      const generatedTextRef = await addDoc(collection(db, "generated_texts"), {
        user_id: user.uid,
        agent: agent,
        texts: texts,
        form_data: formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log("Texto gerado salvo no Firestore:", generatedTextRef.id);
    } catch (error) {
      console.error("Erro ao salvar texto gerado:", error);
    }
  };

  const handleGenerateText = async () => {
    try {
      setLoading(true);
      toast({
        title: "Gerando conteúdo",
        description: "Aguarde enquanto a IA processa seu pedido...",
      });

      // Validating input data
      if (activeAgent === 'carousel' && !formData.topic) {
        throw new Error("Por favor, informe o tema do carrossel");
      }
      
      if (activeAgent === 'yuri' && !formData.topic) {
        throw new Error("Por favor, informe o tema do carrossel");
      }
      
      if (activeAgent === 'formatter' && !formData.content) {
        throw new Error("Por favor, informe o conteúdo a ser formatado");
      }
      
      // Determinar a contagem de slides com o limite máximo aplicado
      const slideCount = Math.min(
        activeAgent === 'carousel' ? 6 : 
        activeAgent === 'yuri' ? 6 : 
        Math.max(3, Math.ceil(formData.content.length / 250)),
        MAX_SLIDES_ALLOWED
      );
      
      console.log("Chamando Edge Function para geração de conteúdo");
      
      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          agent: activeAgent,
          topic: formData.topic,
          audience: formData.audience,
          goal: formData.goal,
          content: formData.content,
          prompt: formData.prompt,
          slideCount: slideCount
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        throw new Error(error.message || "Erro ao gerar conteúdo");
      }

      console.log("Resposta da Edge Function:", data);

      if (!data.success) {
        throw new Error(data.error || "Erro ao gerar conteúdo");
      }
      
      setRawGeneratedText(data.generatedText || "");
      
      if (data.parsedTexts && Array.isArray(data.parsedTexts) && data.parsedTexts.length > 0) {
        const limitedParsedTexts = data.parsedTexts.slice(0, MAX_SLIDES_ALLOWED);
        
        setParsedTexts(limitedParsedTexts);
        
        // Salvar no Firestore
        await saveGeneratedTextToFirestore(limitedParsedTexts, activeAgent);
        
        toast({
          title: "Sucesso!",
          description: `${limitedParsedTexts.length} slides foram gerados com sucesso.`,
        });
      } else {
        // Como fallback, tentamos analisar o texto bruto
        try {
          const textosParsedManualmente = parseRawText(data.generatedText || "");
          const limitedTexts = textosParsedManualmente.slice(0, MAX_SLIDES_ALLOWED);
          
          if (limitedTexts.length > 0) {
            setParsedTexts(limitedTexts);
            await saveGeneratedTextToFirestore(limitedTexts, activeAgent);
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
