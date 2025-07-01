import { useState, useCallback, useEffect } from 'react';
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

export const useStreamingGeneration = (carouselId?: string) => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: null,
    logs: [],
    slides: [],
    error: null
  });
  const { toast } = useToast();

  // Chave para localStorage baseada no carouselId
  const getStorageKey = useCallback((id: string) => `generated_content_${id}`, []);

  // Salvar no localStorage
  const saveToStorage = useCallback((data: StreamingState, id: string) => {
    try {
      const storageData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(getStorageKey(id), JSON.stringify(storageData));
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
    }
  }, [getStorageKey]);

  // Carregar do localStorage
  const loadFromStorage = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(getStorageKey(id));
      if (stored) {
        const data = JSON.parse(stored);
        return {
          isStreaming: false,
          progress: data.progress,
          logs: data.logs || [],
          slides: data.slides || [],
          error: data.error,
          timestamp: data.timestamp
        };
      }
    } catch (error) {
      console.warn('Erro ao carregar do localStorage:', error);
    }
    return null;
  }, [getStorageKey]);

  // Limpar localStorage
  const clearStorage = useCallback((id: string) => {
    try {
      localStorage.removeItem(getStorageKey(id));
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }, [getStorageKey]);

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    if (carouselId) {
      const saved = loadFromStorage(carouselId);
      if (saved) {
        setState(saved);
      }
    }
  }, [carouselId, loadFromStorage]);

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
                  setState(prev => {
                    const newState = {
                      ...prev,
                      progress: data,
                      logs: [...prev.logs, data.message]
                    };
                    if (carouselId) saveToStorage(newState, carouselId);
                    return newState;
                  });
                } else if (data.success !== undefined) {
                  if (data.success) {
                    setState(prev => {
                      const newState = {
                        ...prev,
                        isStreaming: false,
                        slides: data.slides || [],
                        logs: [...prev.logs, data.message]
                      };
                      if (carouselId) saveToStorage(newState, carouselId);
                      return newState;
                    });
                    
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
    if (carouselId) {
      clearStorage(carouselId);
    }
  }, [carouselId, clearStorage]);

  const clearAll = useCallback(() => {
    if (carouselId) {
      clearStorage(carouselId);
    }
    setState({
      isStreaming: false,
      progress: null,
      logs: [],
      slides: [],
      error: null
    });
  }, [carouselId, clearStorage]);

  const hasContent = state.slides.length > 0 || state.logs.length > 0;

  return {
    ...state,
    startStreaming,
    reset,
    clearAll,
    hasContent
  };
};