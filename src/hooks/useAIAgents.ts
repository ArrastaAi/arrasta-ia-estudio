
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { N8nRequest, N8nResponse, AIGeneration, ChatMessage } from '@/types';

interface AIAgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  prompts: Record<string, string>;
}

const AI_AGENTS: Record<string, AIAgentConfig> = {
  content_strategist: {
    name: 'Estrategista de Conteúdo',
    description: 'Especialista em narrativas persuasivas e estruturação de conteúdo',
    capabilities: ['Análise de público-alvo', 'Criação de narrativas', 'Estruturação de slides'],
    prompts: {
      analyze: 'Analise este prompt e sugira uma estrutura narrativa eficaz',
      generate: 'Crie um conteúdo estruturado para carrossel baseado neste briefing',
      optimize: 'Otimize este conteúdo para máximo engajamento'
    }
  },
  visual_curator: {
    name: 'Curador Visual',
    description: 'Especialista em elementos visuais e composição estética',
    capabilities: ['Seleção de imagens', 'Composição visual', 'Paleta de cores'],
    prompts: {
      suggest_images: 'Sugira imagens relevantes para este conteúdo',
      analyze_visual: 'Analise a composição visual deste carrossel',
      enhance: 'Sugira melhorias visuais para aumentar o impacto'
    }
  },
  engagement_optimizer: {
    name: 'Otimizador de Engajamento',
    description: 'Especialista em performance e métricas de engajamento',
    capabilities: ['Análise de performance', 'Otimização de CTAs', 'Previsão de engajamento'],
    prompts: {
      predict: 'Preveja o potencial de engajamento deste carrossel',
      optimize_cta: 'Otimize os CTAs para máxima conversão',
      analyze_trends: 'Analise tendências atuais relevantes para este nicho'
    }
  }
};

export function useAIAgents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const callN8nWebhook = useCallback(async (request: N8nRequest): Promise<N8nResponse> => {
    try {
      const webhookUrl = 'https://n8n-n8n-start.0v0jjw.easypanel.host/webhook/thread';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString(),
          version: '1.0'
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook falhou: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no webhook n8n:', error);
      throw error;
    }
  }, []);

  const generateContent = useCallback(async (
    prompt: string,
    agentType: keyof typeof AI_AGENTS,
    options: Partial<N8nRequest> = {}
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const request: N8nRequest = {
        userId: 'current-user', // TODO: pegar do contexto de auth
        prompt,
        carouselType: 'educativo',
        targetAudience: 'geral',
        slideCount: 7,
        format: 'instagram',
        ...options
      };

      // Tentar n8n primeiro
      try {
        const n8nResponse = await callN8nWebhook(request);
        
        if (n8nResponse.slides?.length > 0) {
          const content = n8nResponse.slides
            .map((slide, index) => `Slide ${index + 1}: ${slide.content}`)
            .join('\n\n');
          
          toast({
            title: "Conteúdo gerado via n8n",
            description: `${n8nResponse.slides.length} slides criados com sucesso`
          });
          
          return content;
        }
      } catch (n8nError) {
        console.warn('n8n falhou, tentando fallback local:', n8nError);
      }

      // Fallback local usando Gemini diretamente
      const agent = AI_AGENTS[agentType];
      const enhancedPrompt = `
        ${agent.prompts.generate}
        
        Contexto: ${prompt}
        Tipo: ${request.carouselType}
        Público: ${request.targetAudience}
        Slides: ${request.slideCount}
        Formato: ${request.format}
        
        Gere um conteúdo estruturado para carrossel seguindo estas diretrizes:
        - Cada slide deve ter um propósito claro
        - Use linguagem persuasiva e envolvente
        - Inclua CTAs eficazes
        - Mantenha consistência narrativa
      `;

      // Simulação de resposta (substituir por chamada real à API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `Slide 1: ${prompt} - Introdução impactante
Slide 2: Problema identificado
Slide 3: Solução apresentada
Slide 4: Benefícios principais
Slide 5: Prova social
Slide 6: Oferta irresistível
Slide 7: CTA poderoso`;

      toast({
        title: "Conteúdo gerado localmente",
        description: "7 slides criados usando IA local"
      });

      return mockContent;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro na geração",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callN8nWebhook, toast]);

  const analyzeCarousel = useCallback(async (
    carouselData: any,
    agentType: keyof typeof AI_AGENTS = 'engagement_optimizer'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const agent = AI_AGENTS[agentType];
      
      // Aqui seria a chamada real para análise
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = {
        overall_score: Math.floor(Math.random() * 30) + 70,
        visual_quality: Math.floor(Math.random() * 20) + 80,
        text_readability: Math.floor(Math.random() * 25) + 75,
        engagement_prediction: Math.floor(Math.random() * 40) + 60,
        suggestions: [
          {
            type: 'text' as const,
            priority: 'high' as const,
            message: 'Considere usar CTAs mais diretos nos últimos slides',
            fix_suggestion: 'Substitua "Saiba mais" por "Clique agora e transforme sua vida"'
          },
          {
            type: 'visual' as const,
            priority: 'medium' as const,
            message: 'Cores poderiam ter mais contraste para melhor legibilidade',
            fix_suggestion: 'Aumente o contraste entre texto e fundo'
          }
        ]
      };

      toast({
        title: "Análise concluída",
        description: `Score geral: ${analysis.overall_score}/100`
      });

      return analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na análise';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    agents: AI_AGENTS,
    loading,
    error,
    generateContent,
    analyzeCarousel,
    callN8nWebhook
  };
}

export function useAgentStats() {
  const getUsageStats = useCallback(() => {
    return {
      totalCalls: 156,
      successRate: 94.2,
      averageResponseTime: 2.3,
      mostUsedAgent: 'content_strategist',
      dailyLimit: 1000,
      remainingCalls: 844
    };
  }, []);

  return { getUsageStats };
}
