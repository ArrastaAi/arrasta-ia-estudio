import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Users, Target, BookOpen, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';
import AgentProgressIndicator from './AgentProgressIndicator';

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
  const { 
    isStreaming, 
    progress, 
    logs, 
    slides, 
    error, 
    startStreaming, 
    reset 
  } = useStreamingGeneration(carouselId);
  
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    intention: 'educar',
    slideCount: 5,
    context: ''
  });

  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [editableSlides, setEditableSlides] = useState<any[]>([]);

  // Mostrar conteúdo gerado automaticamente se existir
  React.useEffect(() => {
    if (slides.length > 0) {
      setEditableSlides(slides);
    }
  }, [slides]);

  const handleSlideChange = (index: number, field: string, value: string | string[]) => {
    setEditableSlides(prev => 
      prev.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    );
  };

  const handleApplyGeneratedContent = () => {
    if (editableSlides.length > 0) {
      const convertedTexts = editableSlides.map((slide, index) => ({
        id: index + 1,
        text: slide.title + (slide.subtitle ? `\n${slide.subtitle}` : '') + 
              (slide.body.length > 0 ? `\n${slide.body.join('\n')}` : '')
      }));
      onApplyTexts(convertedTexts);
      
      // Navegar para a aba Design após aplicar
      setTimeout(() => {
        const designTab = document.querySelector('[value="design"]') as HTMLButtonElement;
        if (designTab) {
          designTab.click();
        }
      }, 500);
    }
  };

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

    reset();
    
    await startStreaming({
      topic: formData.topic,
      audience: formData.audience,
      intention: formData.intention,
      slideCount: formData.slideCount,
      context: formData.context
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
            disabled={isStreaming || !formData.topic.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
          >
            {isStreaming ? (
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

      <AgentProgressIndicator 
        progress={progress}
        logs={logs}
        isStreaming={isStreaming}
      />

      {/* Conteúdo Gerado para Edição */}
      {slides.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Conteúdo Gerado ({slides.length} slides)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingGenerated(!isEditingGenerated)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isEditingGenerated ? 'Visualizar' : 'Editar'}
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Revise e edite o conteúdo antes de aplicar ao designer
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {editableSlides.map((slide, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <Label className="text-purple-400 font-medium text-sm">
                      Slide {index + 1}
                    </Label>
                  </div>
                  
                  {isEditingGenerated ? (
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
                        {slide.body.map((line: string, lineIndex: number) => (
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
              onClick={handleApplyGeneratedContent}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 font-medium"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Aplicar ao Designer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NativeContentGenerator;