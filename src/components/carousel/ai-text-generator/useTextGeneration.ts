
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseTextGeneration } from '@/hooks/useFirebaseTextGeneration';

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
  const { generateText } = useFirebaseTextGeneration();

  const generateTextContent = async (params: GenerateTextParams): Promise<string | null> => {
    setLoading(true);
    try {
      const result = await generateText({
        prompt: params.prompt,
        targetAudience: params.targetAudience || "Público geral",
        contentType: params.contentType || 'content',
        slideIndex: params.slideIndex || 0,
        carouselId: params.carouselId
      });

      if (result) {
        toast({
          title: "Texto gerado com sucesso!",
          description: "O conteúdo foi gerado e pode ser editado conforme necessário."
        });
        return result;
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
