
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface APIKeyManagementPanelProps {
  className?: string;
}

const APIKeyManagementPanel: React.FC<APIKeyManagementPanelProps> = ({ className }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Salvar configuração no localStorage por simplicidade
      localStorage.setItem('n8n_webhook_url', n8nWebhookUrl);
      
      toast({
        title: "Configuração salva",
        description: "URL do webhook N8N foi salva com sucesso"
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    // Carregar configuração salva
    const savedUrl = localStorage.getItem('n8n_webhook_url');
    if (savedUrl) {
      setN8nWebhookUrl(savedUrl);
    }
  }, []);

  return (
    <Card className={`${className} bg-gray-800 border-gray-700`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuração N8N
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure o webhook do N8N para geração de conteúdo
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="n8nUrl" className="text-white">URL do Webhook N8N</Label>
          <Input
            id="n8nUrl"
            value={n8nWebhookUrl}
            onChange={(e) => setN8nWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={saving || !n8nWebhookUrl.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default APIKeyManagementPanel;
