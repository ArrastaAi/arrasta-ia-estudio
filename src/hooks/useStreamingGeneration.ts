import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

interface StreamingProgress {
  stage: string;
  message: string;
  progress: number;
}

interface StreamingState {
  isStreaming: boolean;
  progress: StreamingProgress | null;
  logs: string[];
  slides: SlideContent[];
  error: string | null;
}

export const useStreamingGeneration = () => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: null,
    logs: [],
    slides: [],
    error: null
  });
  const { toast } = useToast();

  const startStreaming = useCallback(async (request: any) => {
    setState({
      isStreaming: true,
      progress: null,
      logs: [],
      slides: [],
      error: null
    });

    try {
      const response = await fetch(
        'https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-carousel-content?stream=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40'
          },
          body: JSON.stringify(request)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream not available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ') || line.startsWith('data: ')) {
            const [type, ...rest] = line.split(': ');
            const content = rest.join(': ');

            if (type === 'data' && content) {
              try {
                const data = JSON.parse(content);
                
                if (data.stage) {
                  setState(prev => ({
                    ...prev,
                    progress: data,
                    logs: [...prev.logs, data.message]
                  }));
                } else if (data.success !== undefined) {
                  if (data.success) {
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      slides: data.slides || [],
                      logs: [...prev.logs, data.message]
                    }));
                    
                    toast({
                      title: "Conteúdo gerado com sucesso!",
                      description: `${data.slides?.length || 0} slides foram criados pelos agentes especializados.`
                    });
                  } else {
                    throw new Error(data.error || 'Erro desconhecido');
                  }
                }
              } catch (parseError) {
                console.warn('Erro ao processar evento SSE:', parseError);
              }
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Erro no streaming:', error);
      
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error.message,
        logs: [...prev.logs, `❌ Erro: ${error.message}`]
      }));
      
      toast({
        title: "Erro ao gerar conteúdo",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      progress: null,
      logs: [],
      slides: [],
      error: null
    });
  }, []);

  return {
    ...state,
    startStreaming,
    reset
  };
};