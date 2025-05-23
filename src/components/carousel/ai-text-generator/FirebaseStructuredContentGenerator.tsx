import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { generateAgentContent } from "@/firebase/functions/generateAgentContent";
import { useFirebaseAPIKeyManager } from "@/hooks/useFirebaseAPIKeyManager";

interface SlideWordCount {
  slideIndex: number; // 1-based
  wordCount: number;
  fontFamily: string;
}

interface FirebaseStructuredContentGeneratorProps {
  carouselId: string;
  slideCount: number;
  onContentGenerated: (content: { id: number; text: string }[]) => void;
}

const FirebaseStructuredContentGenerator: React.FC<FirebaseStructuredContentGeneratorProps> = ({
  carouselId,
  slideCount,
  onContentGenerated
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const { toast } = useToast();
  const { getBestAvailableKey, incrementKeyUsage } = useFirebaseAPIKeyManager();
  
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
  
  // Verificar disponibilidade da API Key ao carregar
  useEffect(() => {
    checkApiKeyAvailability();
  }, []);
  
  const checkApiKeyAvailability = async () => {
    try {
      const apiKey = getBestAvailableKey();
      setApiKeyMissing(!apiKey);
    } catch (err) {
      console.error("Erro ao verificar chave API:", err);
      setApiKeyMissing(true);
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleGenerateContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "Por favor, forneça algum conteúdo para estruturar.",
        variant: "destructive",
      });
      return;
    }
    
    if (apiKeyMissing) {
      toast({
        title: "Chave API Ausente",
        description: "Configure uma chave API válida nas configurações antes de gerar conteúdo.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      toast({
        title: "Estruturando conteúdo",
        description: "Aguarde enquanto o conteúdo está sendo estruturado...",
      });
      
      // Limitar o número real de slides para 9
      const actualSlideCount = Math.min(slideCount, 9);
      
      // Ajustar wordCountRules baseado no número de slides
      const wordCountRules = exactWordCounts.filter(rule => 
        rule.slideIndex <= actualSlideCount
      );
      
      console.log("Gerando conteúdo estruturado com", actualSlideCount, "slides");
      
      // Obter a melhor chave disponível
      const apiKey = getBestAvailableKey();
      if (!apiKey) {
        throw new Error("Nenhuma chave API disponível");
      }
      
      // Chamar a função do Firebase
      const data = await generateAgentContent({
        agent: "promptCreator",
        content,
        apiKey,
        slideCount: actualSlideCount,
        format: {
          slideCounts: actualSlideCount,
          wordLimits: wordCountRules.map(rule => rule.wordCount)
        },
        maxSlidesAllowed: 9
      });
      
      if (!data.success) {
        throw new Error(data.error || "Falha na geração de conteúdo estruturado");
      }
      
      // Incrementar o uso da chave API
      await incrementKeyUsage(apiKey);
      
      // Limitar para 9 slides se houver mais
      const structuredContent = data.parsedTexts?.slice(0, 9) || [];
      
      console.log("Conteúdo estruturado gerado:", structuredContent);
      onContentGenerated(structuredContent);
      
      toast({
        title: "Conteúdo estruturado",
        description: `${structuredContent.length} blocos de texto foram estruturados com sucesso.`,
      });
    } catch (err: any) {
      console.error("Erro na geração de conteúdo estruturado:", err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao estruturar o conteúdo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="structured-content" className="text-white mb-2 block">Conteúdo para estruturar</Label>
        <Textarea 
          id="structured-content"
          placeholder="Cole aqui o conteúdo que deseja transformar em um carrossel estruturado..." 
          value={content}
          onChange={handleContentChange}
          className="bg-gray-700 border-gray-600 text-white h-40 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          A IA estruturará seu texto em blocos com contagem de palavras específicas para carrosséis de alta conversão.
        </p>
      </div>
      
      {apiKeyMissing && (
        <div className="text-amber-400 text-sm border border-amber-600 bg-amber-950/30 p-3 rounded-md">
          ⚠️ Chave API não configurada. 
          <Link to="/settings" className="ml-1 text-amber-300 hover:text-amber-200 underline">
            Clique aqui para configurar uma chave de API válida.
          </Link>
        </div>
      )}
      
      <Button
        onClick={handleGenerateContent}
        disabled={loading || apiKeyMissing}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Estruturando conteúdo...
          </>
        ) : (
          "Estruturar conteúdo"
        )}
      </Button>
    </div>
  );
};

export default FirebaseStructuredContentGenerator;
