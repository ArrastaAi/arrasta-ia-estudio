import { useState, useCallback, useRef } from 'react';
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
  canRetry: boolean;
}

export const useStreamingGeneration = () => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: null,
    logs: [],
    slides: [],
    error: null,
    canRetry: true
  });
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = useCallback(async (request: any) => {
    console.log('🚀 Iniciando geração com agentes:', request);
    
    // Cancelar operação anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setState({
      isStreaming: true,
      progress: null,
      logs: ['🤖 Inicializando sistema de agentes especializados...'],
      slides: [],
      error: null,
      canRetry: true
    });

    // Timeout de segurança (2 minutos)
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ Timeout atingido, cancelando operação');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: 'Operação expirou (timeout de 2 minutos)',
        logs: [...prev.logs, '❌ Operação cancelada por timeout']
      }));
    }, 120000); // 2 minutos

    try {
      setState(prev => ({
        ...prev,
        logs: [...prev.logs, '🌐 Conectando com a API...']
      }));

      const response = await fetch(
        'https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-carousel-content?stream=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40'
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        console.log('❌ Erro HTTP:', response.status, response.statusText);
        
        if (response.status === 429) {
          throw new Error('Limite de quota da API atingido. Aguarde alguns minutos antes de tentar novamente.');
        }
        
        if (response.status >= 500) {
          throw new Error(`Erro do servidor (${response.status}). Tente novamente em alguns instantes.`);
        }
        
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      setState(prev => ({
        ...prev,
        logs: [...prev.logs, '✅ Conexão estabelecida, iniciando stream...']
      }));

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream not available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let lastEventTime = Date.now();

      setState(prev => ({
        ...prev,
        logs: [...prev.logs, '📡 Aguardando dados do stream...']
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('📍 Stream finalizado');
          break;
        }

        lastEventTime = Date.now();
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
                console.log('📨 Evento recebido:', data);
                
                if (data.stage) {
                  setState(prev => ({
                    ...prev,
                    progress: data,
                    logs: [...prev.logs, `🎯 ${data.stage}: ${data.message}`]
                  }));
                } else if (data.success !== undefined) {
                  if (data.success) {
                    console.log('✅ Geração concluída com sucesso');
                    setState(prev => ({
                      ...prev,
                      isStreaming: false,
                      slides: data.slides || [],
                      logs: [...prev.logs, '🎉 Conteúdo gerado com sucesso!']
                    }));
                    
                    toast({
                      title: "Conteúdo gerado com sucesso!",
                      description: `${data.slides?.length || 0} slides foram criados pelos agentes especializados.`
                    });
                  } else {
                    throw new Error(data.error || 'Erro desconhecido na geração');
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Erro ao processar evento SSE:', parseError);
                setState(prev => ({
                  ...prev,
                  logs: [...prev.logs, `⚠️ Erro no parsing: ${parseError}`]
                }));
              }
            }
          }
        }
      }

    } catch (error: any) {
      console.error('💥 Erro no streaming:', error);
      
      // Limpar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Verificar se foi cancelado
      if (error.name === 'AbortError') {
        console.log('🛑 Operação cancelada pelo usuário');
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: 'Operação cancelada',
          logs: [...prev.logs, '🛑 Operação cancelada pelo usuário'],
          canRetry: true
        }));
        return;
      }
      
      // Verificar se é erro de quota
      const isQuotaError = error.message.includes('quota') || error.message.includes('429');
      const canRetryError = !isQuotaError && !error.message.includes('timeout');
      
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error.message,
        logs: [...prev.logs, `❌ Erro: ${error.message}`],
        canRetry: canRetryError
      }));
      
      if (isQuotaError) {
        toast({
          title: "Limite de API atingido",
          description: "Aguarde alguns minutos antes de tentar novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao gerar conteúdo",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [toast]);

  const reset = useCallback(() => {
    console.log('🔄 Resetando estado do gerador');
    
    // Cancelar operações em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState({
      isStreaming: false,
      progress: null,
      logs: [],
      slides: [],
      error: null,
      canRetry: true
    });
  }, []);

  const forceStop = useCallback(() => {
    console.log('🛑 Forçando parada da operação');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: 'Operação interrompida pelo usuário',
      logs: [...prev.logs, '🛑 Operação interrompida manualmente']
    }));
  }, []);

  return {
    ...state,
    startStreaming,
    reset,
    forceStop
  };
};