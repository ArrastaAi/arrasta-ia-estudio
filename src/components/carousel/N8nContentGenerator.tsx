
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, AlertCircle, Check, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneratedText {
  id: number;
  text: string;
}

interface N8nContentGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: GeneratedText[]) => void;
}

const N8nContentGenerator: React.FC<N8nContentGeneratorProps> = ({
  carouselId,
  onApplyTexts
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    intention: 'educar',
    slideCount: 5,
    context: ''
  });

  const intentions = [
    { value: 'educar', label: 'Educar' },
    { value: 'vender', label: 'Vender' },
    { value: 'engajar', label: 'Engajar' },
    { value: 'gerar-consciencia', label: 'Gerar Consciência' },
    { value: 'storytelling', label: 'Storytelling' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (id: number, newText: string) => {
    setGeneratedTexts(prev => 
      prev.map(text => text.id === id ? { ...text, text: newText } : text)
    );
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para usar esta funcionalidade",
        variant: "destructive"
      });
      return;
    }

    if (!formData.topic.trim()) {
      toast({
        title: "Tema obrigatório",
        description: "Por favor, informe o tema do carrossel",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Iniciando geração de conteúdo...');
      console.log('Dados do formulário:', formData);

      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40`
        },
        body: JSON.stringify({
          topic: formData.topic,
          audience: formData.audience,
          intention: formData.intention,
          slideCount: formData.slideCount,
          context: formData.context
        })
      });

      console.log('Resposta da Edge Function - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da Edge Function:', errorText);
        throw new Error(`Erro na geração: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data.success && data.parsedTexts && Array.isArray(data.parsedTexts)) {
        console.log(`${data.parsedTexts.length} slides gerados`);
        setGeneratedTexts(data.parsedTexts);
        setIsEditing(false);
        
        toast({
          title: "Conteúdo gerado com sucesso!",
          description: `${data.parsedTexts.length} slides foram gerados. Revise e edite se necessário.`
        });
      } else {
        console.error('Dados inválidos recebidos:', data);
        throw new Error(data.error || "Erro ao processar resposta da geração");
      }

    } catch (error: any) {
      console.error('Erro completo ao gerar conteúdo:', error);
      
      let errorMessage = "Houve um problema na geração. Tente novamente.";
      
      if (error.message.includes('404')) {
        errorMessage = "Serviço N8N indisponível. Verifique a configuração do webhook.";
      } else if (error.message.includes('500')) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
      } else if (error.message.includes('fetch')) {
        errorMessage = "Problema de conectividade com o N8N. Verifique se o webhook está ativo.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao gerar conteúdo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyContent = () => {
    if (generatedTexts.length === 0) return;
    
    onApplyTexts(generatedTexts);
    
    toast({
      title: "Conteúdo aplicado!",
      description: `${generatedTexts.length} slides foram aplicados ao carrossel. Acesse a aba Designer para continuar editando.`
    });
  };

  return (
    <div className="space-y-6">

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Gerador de Conteúdo IA
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure os parâmetros para gerar conteúdo personalizado via N8N
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic" className="text-white">Tema/Tópico *</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="Ex: Marketing digital para pequenas empresas"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="audience" className="text-white">Público-alvo</Label>
            <Input
              id="audience"
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              placeholder="Ex: Empreendedores iniciantes, profissionais de marketing..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="intention" className="text-white">Intenção</Label>
            <Select 
              value={formData.intention} 
              onValueChange={(value) => handleInputChange('intention', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {intentions.map((intention) => (
                  <SelectItem key={intention.value} value={intention.value} className="text-white hover:bg-gray-600">
                    {intention.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="slideCount" className="text-white">Número de slides</Label>
            <Select 
              value={formData.slideCount.toString()} 
              onValueChange={(value) => handleInputChange('slideCount', parseInt(value))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {Array.from({ length: 9 }, (_, i) => i + 4).map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-600">
                    {num} slides
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="context" className="text-white">Contexto adicional</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => handleInputChange('context', e.target.value)}
              placeholder="Informações adicionais, tom de voz, detalhes específicos..."
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando conteúdo...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedTexts.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Conteúdo Gerado ({generatedTexts.length} slides)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isEditing ? 'Visualizar' : 'Editar'}
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Revise e edite o conteúdo antes de aplicar ao carrossel
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedTexts.map((text) => (
                <div key={text.id} className="p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <Label className="text-purple-400 font-medium text-sm">
                      Slide {text.id}
                    </Label>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={text.text}
                      onChange={(e) => handleTextChange(text.id, e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white min-h-[80px] resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-white text-sm leading-relaxed">
                      {text.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleApplyContent}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 font-medium"
            >
              <Check className="mr-2 h-4 w-4" />
              Aplicar Conteúdo ao Carrossel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default N8nContentGenerator;
