
import { useToast } from "@/hooks/use-toast";

interface N8nWebhookData {
  topic: string;
  audience?: string;
  goal?: string;
  slideCount?: number;
  [key: string]: any;
}

export class N8nIntegrationService {
  private static instance: N8nIntegrationService;
  private webhookUrl: string | null = null;

  private constructor() {
    // Carregar URL do localStorage
    this.webhookUrl = localStorage.getItem('n8n_webhook_url');
  }

  public static getInstance(): N8nIntegrationService {
    if (!N8nIntegrationService.instance) {
      N8nIntegrationService.instance = new N8nIntegrationService();
    }
    return N8nIntegrationService.instance;
  }

  public setWebhookUrl(url: string): void {
    this.webhookUrl = url;
    localStorage.setItem('n8n_webhook_url', url);
  }

  public async generateContent(data: N8nWebhookData): Promise<any> {
    if (!this.webhookUrl) {
      throw new Error('URL do webhook N8N não configurada');
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'carousel-generator'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição N8N: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao chamar N8N:', error);
      throw error;
    }
  }

  public isConfigured(): boolean {
    return !!this.webhookUrl;
  }
}

export const n8nService = N8nIntegrationService.getInstance();
