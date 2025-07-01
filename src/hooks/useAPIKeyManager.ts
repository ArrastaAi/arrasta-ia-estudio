
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAPIKeyManager = () => {
  const { toast } = useToast();
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar URL do N8N do localStorage
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      setN8nWebhookUrl(savedUrl);
    }
  }, []);

  const saveN8nWebhookUrl = async (url: string) => {
    try {
      setLoading(true);
      localStorage.setItem('n8n_webhook_url', url);
      setN8nWebhookUrl(url);
      
      toast({
        title: "Configuração salva",
        description: "URL do webhook N8N foi salva com sucesso"
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const callN8nWebhook = async (data: any) => {
    if (!n8nWebhookUrl) {
      toast({
        title: "Erro",
        description: "URL do webhook N8N não configurada",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao chamar N8N",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    n8nWebhookUrl,
    loading,
    saveN8nWebhookUrl,
    callN8nWebhook
  };
};
