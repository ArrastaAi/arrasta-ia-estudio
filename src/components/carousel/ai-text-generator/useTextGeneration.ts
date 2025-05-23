
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateAgentContent } from '@/firebase/functions/generateAgentContent';
import { useFirebaseAPIKeyManager } from '@/hooks/useFirebaseAPIKeyManager';

interface GenerateTextParams {
  prompt: string;
  targetAudience?: string;
  contentType?: 'title' | 'content' | 'cta';
  slideIndex?: number;
  carouselId: string;
}

export const useTextGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getBestAvailableKey, incrementKeyUsage } = useFirebaseAPIKeyManager();

  const generateTextContent = async (params: GenerateTextParams): Promise<string | null> => {
    setLoading(true);
    try {
      const apiKey = getBestAvailableKey();
      if (!apiKey) {
        toast({
          title: "Chave API necessária",
          description: "Configure uma chave do Google Gemini nas configurações",
          variant: "destructive"
        });
        return null;
      }

      const result = await generateAgentContent({
        agent: "yuri",
        prompt: params.prompt,
        topic: params.prompt,
        audience: params.targetAudience || "Público geral",
        goal: "educar",
        apiKey,
        slideCount: 1,
        content: "",
        format: {
          slideCounts: 1,
          wordLimits: [25]
        },
        maxSlidesAllowed: 1
      });

      if (result.success && result.parsedTexts && result.parsedTexts.length > 0) {
        await incrementKeyUsage(apiKey);
        toast({
          title: "Texto gerado com sucesso!",
          description: "O conteúdo foi gerado e pode ser editado conforme necessário."
        });
        return result.parsedTexts[0].text;
      }

      throw new Error('Nenhum conteúdo foi gerado');
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      toast({
        title: "Erro ao gerar texto",
        description: "Houve um problema ao gerar o texto. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateTextContent,
    loading
  };
};
