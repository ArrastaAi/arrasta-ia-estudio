import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseRawText } from "@/components/carousel/ai-text-generator/textParser";
import { useFirebaseAPIKeyManager } from "@/hooks/useFirebaseAPIKeyManager";
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
      throw error; // Remove fallback to force proper error handling
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
      
      // Sempre gerar 9 slides (máximo permitido)
      const slideCount = MAX_SLIDES_ALLOWED;
      
      console.log("Gerando conteúdo com:", { agent: activeAgent, topic: formData.topic, slideCount });
      
      // Chamar Edge Function do Supabase
      const data = await callSupabaseEdgeFunction({
        agent: activeAgent,
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        content: formData.content,
        prompt: formData.prompt,
        slideCount: slideCount
      });

      console.log("Resposta da geração:", data);

      if (!data.success) {
        throw new Error(data.error || "Erro ao gerar conteúdo");
      }
      
      setRawGeneratedText(data.generatedText || "");
      
      if (data.parsedTexts && Array.isArray(data.parsedTexts) && data.parsedTexts.length > 0) {
        const limitedParsedTexts = data.parsedTexts.slice(0, MAX_SLIDES_ALLOWED);
        
        setParsedTexts(limitedParsedTexts);
        
        // Salvar no Firebase Firestore
        await saveGeneratedTextToFirestore(limitedParsedTexts, activeAgent);
        
        toast({
          title: "Sucesso!",
          description: `${limitedParsedTexts.length} slides foram gerados com sucesso.`,
        });
      } else {
        throw new Error("Não foi possível processar o texto gerado.");
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
