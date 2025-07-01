import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

interface GeneratedText {
  id: number;
  text: string;
}

interface GenerationRequest {
  topic: string;
  audience: string;
  intention: string;
  slideCount: number;
  context?: string;
}

interface GenerationResponse {
  success: boolean;
  slides?: SlideContent[];
  error?: string;
  agent_logs?: string[];
}

export const useCarouselGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<SlideContent[]>([]);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const generateCarouselContent = async (request: GenerationRequest): Promise<GenerationResponse> => {
    setLoading(true);
    setAgentLogs([]);
    
    try {
      console.log('Iniciando geracao nativa com agentes...', request);

      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-carousel-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40'
        },
        body: JSON.stringify(request)
      });

      console.log('Resposta da Edge Function - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da Edge Function:', errorText);
        throw new Error('Erro na geracao: ' + response.status + ' - ' + errorText);
      }

      const data: GenerationResponse = await response.json();
      console.log('Dados recebidos:', data);

      if (data.success && data.slides && Array.isArray(data.slides)) {
        console.log(data.slides.length + ' slides gerados com sucesso');
        setGeneratedSlides(data.slides);
        setAgentLogs(data.agent_logs || []);
        
        toast({
          title: "Conteudo gerado com sucesso!",
          description: data.slides.length + " slides foram criados pelos agentes especializados."
        });

        return data;
      } else {
        console.error('Dados invalidos recebidos:', data);
        throw new Error(data.error || "Erro ao processar resposta da geracao");
      }

    } catch (error: any) {
      console.error('Erro completo ao gerar conteudo:', error);
      
      let errorMessage = "Houve um problema na geracao. Tente novamente.";
      
      if (error.message.includes('404')) {
        errorMessage = "Servico de geracao indisponivel. Verifique a configuracao.";
      } else if (error.message.includes('500')) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
      } else if (error.message.includes('fetch')) {
        errorMessage = "Problema de conectividade. Verifique sua conexao.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao gerar conteudo",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage,
        agent_logs: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  };

  const convertSlidesToTexts = (slides: SlideContent[]): GeneratedText[] => {
    return slides.map((slide, index) => ({
      id: index + 1,
      text: slide.title + '\n\n' + slide.subtitle + '\n\n' + slide.body.join('\n')
    }));
  };

  const clearGeneration = () => {
    setGeneratedSlides([]);
    setAgentLogs([]);
  };

  return {
    loading,
    generatedSlides,
    agentLogs,
    generateCarouselContent,
    convertSlidesToTexts,
    clearGeneration,
    setGeneratedSlides
  };
};