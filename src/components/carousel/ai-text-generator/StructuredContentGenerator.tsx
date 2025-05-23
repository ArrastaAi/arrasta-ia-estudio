
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAgentContent } from '@/firebase/functions/generateAgentContent';
import { useFirebaseAPIKeyManager } from '@/hooks/useFirebaseAPIKeyManager';

interface StructuredContentGeneratorProps {
  onContentGenerated: (content: any) => void;
  carouselId: string;
}

const StructuredContentGenerator: React.FC<StructuredContentGeneratorProps> = ({
  onContentGenerated,
  carouselId
}) => {
  const [prompt, setPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getBestAvailableKey, incrementKeyUsage } = useFirebaseAPIKeyManager();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt obrigatório",
        description: "Por favor, insira um prompt para gerar o conteúdo.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const apiKey = getBestAvailableKey();
      if (!apiKey) {
        toast({
          title: "Chave API necessária",
          description: "Configure uma chave do Google Gemini nas configurações",
          variant: "destructive"
        });
        return;
      }

      const result = await generateAgentContent({
        agent: "yuri",
        topic: prompt.trim(),
        audience: targetAudience.trim() || "Público geral",
        goal: "educar",
        apiKey,
        slideCount,
        content: "",
        prompt: "",
        format: {
          slideCounts: slideCount,
          wordLimits: Array(slideCount).fill(25)
        },
        maxSlidesAllowed: 9
      });

      if (result.success && result.parsedTexts) {
        await incrementKeyUsage(apiKey);
        onContentGenerated(result.parsedTexts);
        toast({
          title: "Conteúdo gerado com sucesso!",
          description: `${slideCount} slides foram criados com base no seu prompt.`
        });
      } else {
        throw new Error(result.error || "Erro ao gerar conteúdo");
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Houve um problema ao gerar o conteúdo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gerador de Conteúdo Estruturado
        </CardTitle>
        <CardDescription>
          Gere automaticamente o conteúdo para o seu carrossel usando IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt" className="text-sm font-medium">
            Prompt principal *
          </Label>
          <Textarea
            id="prompt"
            placeholder="Descreva o tema do seu carrossel (ex: 'Dicas de marketing digital para pequenas empresas')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="targetAudience" className="text-sm font-medium">
            Público-alvo
          </Label>
          <Input
            id="targetAudience"
            placeholder="Ex: Empreendedores, estudantes, profissionais de marketing..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="slideCount" className="text-sm font-medium">
            Número de slides
          </Label>
          <Input
            id="slideCount"
            type="number"
            min="3"
            max="10"
            value={slideCount}
            onChange={(e) => setSlideCount(Math.max(3, Math.min(10, parseInt(e.target.value) || 5)))}
            className="mt-1 w-24"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando conteúdo...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Conteúdo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StructuredContentGenerator;
