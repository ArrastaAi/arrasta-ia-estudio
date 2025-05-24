
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const generateTextContent = async (params: GenerateTextParams): Promise<string | null> => {
    setLoading(true);
    try {
      console.log("Gerando texto individual com Supabase Edge Function:", params);

      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40`
        },
        body: JSON.stringify({
          agent: "yuri",
          prompt: params.prompt,
          topic: params.prompt,
          audience: params.targetAudience || "Público geral",
          goal: "educar",
          content: "",
          slideCount: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na geração: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.parsedTexts && result.parsedTexts.length > 0) {
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
