import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Check, Edit3, Users, Target, BookOpen, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

interface GeneratedText {
  id: number;
  text: string;
}

interface NativeContentGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: GeneratedText[]) => void;
}

const NativeContentGenerator: React.FC<NativeContentGeneratorProps> = ({
  carouselId,
  onApplyTexts
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<SlideContent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    intention: 'educar',
    slideCount: 5,
    context: ''
  });

  const intentions = [
    { value: 'educar', label: 'Educar', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'vender', label: 'Vender', icon: Target, color: 'bg-green-500' },
    { value: 'engajar', label: 'Engajar', icon: Users, color: 'bg-purple-500' },
    { value: 'gerar-consciencia', label: 'Conscientizar', icon: Settings, color: 'bg-orange-500' },
    { value: 'storytelling', label: 'Storytelling', icon: BookOpen, color: 'bg-pink-500' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlideChange = (index: number, field: keyof SlideContent, value: string | string[]) => {
    setGeneratedSlides(prev => 
      prev.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    );
  };

  const convertSlidesToTexts = (slides: SlideContent[]): GeneratedText[] => {
    return slides.map((slide, index) => ({
      id: index + 1,
      text: slide.title + '\n\n' + slide.subtitle + '\n\n' + slide.body.join('\n')
    }));
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
    setAgentLogs([]);
    
    try {
      console.log('Iniciando geracao nativa com agentes...', formData);

      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-carousel-content', {
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
        throw new Error('Erro na geracao: ' + response.status + ' - ' + errorText);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data.success && data.slides && Array.isArray(data.slides)) {
        console.log(data.slides.length + ' slides gerados com sucesso');
        setGeneratedSlides(data.slides);
        setAgentLogs(data.agent_logs || []);
        setIsEditing(false);
        
        toast({
          title: "Conteúdo gerado com sucesso!",
          description: data.slides.length + " slides foram criados pelos agentes especializados."
        });
      } else {
        console.error('Dados invalidos recebidos:', data);
        throw new Error(data.error || "Erro ao processar resposta da geração");
      }

    } catch (error: any) {
      console.error('Erro completo ao gerar conteudo:', error);
      
      let errorMessage = "Houve um problema na geracao. Tente novamente.";
      
      if (error.message.includes('404')) {
        errorMessage = "Servico de geracao indisponivel. Verifique a configuracao.";
      } else if (error.message.includes('500')) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
      } else if (error.message.includes('fetch')) {
        errorMessage = "Problema de conectividade. Verifique sua conexao.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao gerar conteudo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyContent = () => {
    if (generatedSlides.length === 0) return;
    
    const texts = convertSlidesToTexts(generatedSlides);
    onApplyTexts(texts);
    
      toast({
        title: "Conteúdo aplicado!",
        description: generatedSlides.length + " slides foram aplicados ao carrossel."
      });
  };

  const selectedIntention = intentions.find(i => i.value === formData.intention);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Gerador Nativo de Conteúdo IA
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sistema de agentes especializados: Roteirista → Copywriter → Editor → Supervisor
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
            <Label htmlFor="intention" className="text-white">Estratégia de Conteúdo</Label>
            <Select 
              value={formData.intention} 
              onValueChange={(value) => handleInputChange('intention', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {intentions.map((intention) => {
                  const IconComponent = intention.icon;
                  return (
                    <SelectItem 
                      key={intention.value} 
                      value={intention.value} 
                      className="text-white hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${intention.color}`}></div>
                        <IconComponent className="h-4 w-4" />
                        {intention.label}
                      </div>
                    </SelectItem>
                  );
                })}
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
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agentes trabalhando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Gerar com Agentes IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {agentLogs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">🔍 Log dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {agentLogs.map((log, index) => (
                <div key={index} className="text-xs text-gray-400 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedSlides.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Conteúdo Gerado ({generatedSlides.length} slides)
                {selectedIntention && (
                  <Badge variant="secondary" className={`ml-2 ${selectedIntention.color} text-white`}>
                    {selectedIntention.label}
                  </Badge>
                )}
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
              Conteúdo refinado pelos agentes especializados
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedSlides.map((slide, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <Label className="text-purple-400 font-medium text-sm">
                      Slide {index + 1}
                    </Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={slide.title}
                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        placeholder="Título"
                        className="bg-gray-600 border-gray-500 text-white font-bold"
                      />
                      <Input
                        value={slide.subtitle}
                        onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                        placeholder="Subtítulo"
                        className="bg-gray-600 border-gray-500 text-white"
                      />
                      <Textarea
                        value={slide.body.join('\n')}
                        onChange={(e) => handleSlideChange(index, 'body', e.target.value.split('\n'))}
                        placeholder="Corpo do texto (uma linha por item)"
                        className="bg-gray-600 border-gray-500 text-white min-h-[80px]"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-sm">
                        {slide.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {slide.subtitle}
                      </p>
                      <div className="space-y-1">
                        {slide.body.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-white text-sm leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleApplyContent}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 font-medium"
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

export default NativeContentGenerator;