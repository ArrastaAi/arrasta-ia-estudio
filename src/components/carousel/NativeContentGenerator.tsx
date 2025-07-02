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
  const [generatedSlides, setGeneratedSlides] = useState<SlideContent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { 
    isStreaming, 
    progress, 
    logs, 
    slides, 
    error, 
    canRetry,
    startStreaming, 
    reset,
    forceStop 
  } = useStreamingGeneration();
  
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    intention: 'storytelling',
    slideCount: 5,
    context: '',
    ctaType: 'auto'
  });

  const intentions = [
    { value: 'storytelling', label: 'Storytelling', icon: BookOpen, color: 'bg-pink-500' },
    { value: 'educar', label: 'Educar', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'vender', label: 'Vender', icon: Target, color: 'bg-green-500' },
    { value: 'engajar', label: 'Engajar', icon: Users, color: 'bg-purple-500' },
    { value: 'gerar-consciencia', label: 'Conscientizar', icon: Settings, color: 'bg-orange-500' }
  ];

  const ctaTypes = [
    { 
      value: 'curtir', 
      label: 'Curtir', 
      description: 'Incentive curtidas e reações',
      example: '"Curta se você concorda! ❤️"'
    },
    { 
      value: 'comentar', 
      label: 'Comentar', 
      description: 'Estimule comentários e discussões',
      example: '"Conte sua experiência nos comentários! 💬"'
    },
    { 
      value: 'marcar', 
      label: 'Marcar um amigo', 
      description: 'Peça para marcar amigos',
      example: '"Marque aquele amigo que precisa ver isso! 👥"'
    },
    { 
      value: 'compartilhar', 
      label: 'Compartilhar', 
      description: 'Incentive o compartilhamento',
      example: '"Compartilhe para ajudar mais pessoas! 🔄"'
    },
    { 
      value: 'auto', 
      label: 'Auto', 
      description: 'O agente escolhe o melhor CTA',
      example: 'CTA otimizado automaticamente'
    }
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

    reset();
    setGeneratedSlides([]);
    
    await startStreaming({
      topic: formData.topic,
      audience: formData.audience,
      intention: formData.intention,
      slideCount: formData.slideCount,
      context: formData.context,
      ctaType: formData.ctaType
    });
  };

  const handleApplyContent = () => {
    const slidesToApply = slides.length > 0 ? slides : generatedSlides;
    if (slidesToApply.length === 0) return;
    
    const texts = convertSlidesToTexts(slidesToApply);
    onApplyTexts(texts);
    
    toast({
      title: "Conteúdo aplicado ao designer!",
      description: slidesToApply.length + " slides foram aplicados e você será redirecionado para o designer."
    });

    // Navegar automaticamente para a aba Design após aplicar
    setTimeout(() => {
      const designTab = document.querySelector('[value="design"]') as HTMLButtonElement;
      if (designTab) {
        designTab.click();
      }
    }, 500);
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
            <Label htmlFor="ctaType" className="text-white">Tipo de CTA (Último Slide)</Label>
            <Select 
              value={formData.ctaType} 
              onValueChange={(value) => handleInputChange('ctaType', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {ctaTypes.map((cta) => (
                  <SelectItem 
                    key={cta.value} 
                    value={cta.value} 
                    className="text-white hover:bg-gray-600"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{cta.label}</span>
                      <span className="text-xs text-gray-400">{cta.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.ctaType !== 'auto' && (
              <div className="mt-2 p-2 bg-gray-600 rounded text-xs text-gray-300">
                <strong>Exemplo:</strong> {ctaTypes.find(c => c.value === formData.ctaType)?.example}
              </div>
            )}
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

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate}
              disabled={isStreaming || !formData.topic.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
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
            
            {isStreaming && (
              <Button 
                onClick={forceStop}
                variant="destructive"
                size="sm"
                className="px-3"
              >
                🛑
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-red-400 text-sm">❌ {error}</div>
              </div>
              {canRetry && (
                <Button 
                  onClick={() => { reset(); handleGenerate(); }}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AgentProgressIndicator 
        progress={progress}
        logs={logs}
        isStreaming={isStreaming}
        error={error}
      />

      {(slides.length > 0 || generatedSlides.length > 0) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Conteúdo Gerado ({(slides.length > 0 ? slides : generatedSlides).length} slides)
                {selectedIntention && (
                  <>
                    <Badge variant="secondary" className={`ml-2 ${selectedIntention.color} text-white`}>
                      {selectedIntention.label}
                    </Badge>
                    {formData.ctaType !== 'auto' && (
                      <Badge variant="outline" className="ml-2 border-purple-500 text-purple-300">
                        CTA: {ctaTypes.find(c => c.value === formData.ctaType)?.label}
                      </Badge>
                    )}
                  </>
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
              {(slides.length > 0 ? slides : generatedSlides).map((slide, index) => (
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
              Aplicar ao Designer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NativeContentGenerator;
