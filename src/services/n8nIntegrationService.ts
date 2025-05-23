
import { firestore } from "@/integrations/firebase/client";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";

export interface N8nWebhookConfig {
  url: string;
  enabled: boolean;
  apiKey?: string;
  timeout: number;
}

export interface N8nCarouselRequest {
  userId: string;
  carouselId: string;
  topic: string;
  audience: string;
  goal: string;
  slideCount: number;
  layoutType: string;
}

export interface N8nCarouselResponse {
  success: boolean;
  slides: Array<{
    id: number;
    content: string;
    imagePrompt?: string;
  }>;
  error?: string;
}

/**
 * Serviço para integração com n8n para automação de criação de carrosséis
 */
export class N8nIntegrationService {
  
  /**
   * Obtém a configuração do webhook n8n para o usuário
   */
  static async getWebhookConfig(userId: string): Promise<N8nWebhookConfig | null> {
    try {
      const configRef = doc(firestore, "users", userId, "integrations", "n8n");
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        return configSnap.data() as N8nWebhookConfig;
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao buscar configuração n8n:", error);
      return null;
    }
  }

  /**
   * Salva a configuração do webhook n8n para o usuário
   */
  static async saveWebhookConfig(userId: string, config: N8nWebhookConfig): Promise<boolean> {
    try {
      const configRef = doc(firestore, "users", userId, "integrations", "n8n");
      await setDoc(configRef, {
        ...config,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar configuração n8n:", error);
      return false;
    }
  }

  /**
   * Envia requisição para o n8n para criar carrossel
   */
  static async createCarouselWithN8n(
    userId: string,
    request: N8nCarouselRequest
  ): Promise<N8nCarouselResponse> {
    try {
      const config = await this.getWebhookConfig(userId);
      
      if (!config || !config.enabled) {
        throw new Error("Integração n8n não configurada ou desabilitada");
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey && { "X-API-Key": config.apiKey })
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(config.timeout || 30000)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log da requisição para auditoria
      await this.logN8nRequest(userId, request, data);
      
      return data as N8nCarouselResponse;
    } catch (error) {
      console.error("Erro na integração n8n:", error);
      
      // Log do erro
      await this.logN8nRequest(userId, request, { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        slides: []
      });
      
      throw error;
    }
  }

  /**
   * Testa a conexão com o webhook n8n
   */
  static async testWebhookConnection(config: N8nWebhookConfig): Promise<boolean> {
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey && { "X-API-Key": config.apiKey })
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(config.timeout || 10000)
      });

      return response.ok;
    } catch (error) {
      console.error("Erro no teste de conexão n8n:", error);
      return false;
    }
  }

  /**
   * Registra logs das requisições n8n para auditoria
   */
  private static async logN8nRequest(
    userId: string,
    request: N8nCarouselRequest,
    response: any
  ): Promise<void> {
    try {
      const logsRef = collection(firestore, "users", userId, "n8n_logs");
      await addDoc(logsRef, {
        request,
        response,
        timestamp: new Date().toISOString(),
        success: response.success || false
      });
    } catch (error) {
      console.error("Erro ao registrar log n8n:", error);
    }
  }

  /**
   * Obtém estatísticas de uso da integração n8n
   */
  static async getUsageStats(userId: string): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastRequest?: string;
  }> {
    try {
      // TODO: Implementar consulta agregada no Firestore
      // Por enquanto retorna dados mockados
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas n8n:", error);
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
      };
    }
  }
}
