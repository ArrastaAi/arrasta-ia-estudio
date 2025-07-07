import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wand2, Check, X, RefreshCw, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Slide } from '@/types/database.types';

interface GeneratedImage {
  slideId: string;
  slideNumber: number;
  imageUrl: string;
  prompt: string;
  provider: string;
  status: 'generating' | 'success' | 'error';
}

interface AIImageGeneratorProps {
  slides: Slide[];
  theme: string;
  onImagesApplied: (imageUrls: string[]) => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  slides,
  theme,
  onImagesApplied
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<'photographic' | 'illustration' | 'minimalist'>('photographic');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'auto'>('auto');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [generationMethod, setGenerationMethod] = useState<'direct' | 'edge_function'>('direct');
  const [webhookUrl] = useState('https://n8n-n8n-start.0v0jjw.easypanel.host/webhook/thread');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const styles = [
    { 
      value: 'photographic', 
      label: 'Fotográfico', 
      description: 'Imagens realistas e profissionais',
      example: '📸 Fotos de alta qualidade'
    },
    { 
      value: 'illustration', 
      label: 'Ilustração', 
      description: 'Arte digital e design vetorial',
      example: '🎨 Ilustrações coloridas'
    },
    { 
      value: 'minimalist', 
      label: 'Minimalista', 
      description: 'Design limpo e simples',
      example: '✨ Visual clean'
    }
  ];

  const providers = [
    { 
      value: 'auto', 
      label: 'Automático', 
      description: 'Melhor resultado disponível',
      badge: '🤖 Inteligente'
    },
    { 
      value: 'openai', 
      label: 'OpenAI DALL-E', 
      description: 'Alta qualidade, mais detalhado',
      badge: '🎯 Premium'
    },
    { 
      value: 'gemini', 
      label: 'Google Gemini', 
      description: 'Rápido e contextual',
      badge: '⚡ Rápido'
    }
  ];

  // Função para gerar prompt inteligente baseado no conteúdo
  const generatePromptFromContent = (content: string, theme: string, style: string, slideNumber: number): string => {
    const cleanContent = content.replace(/\n+/g, ' ').trim();
    const words = cleanContent.split(' ').slice(0, 10).join(' ');
    
    const stylePrompts = {
      photographic: "professional photography, high quality, realistic, corporate style",
      illustration: "digital illustration, vector art, clean design, modern graphics",
      minimalist: "minimalist design, simple composition, clean background, elegant"
    };

    const basePrompt = `${stylePrompts[selectedStyle]}, ${theme} theme, representing: ${words}`;
    
    if (slideNumber === 1) {
      return `${basePrompt}, introduction slide, engaging opening visual, eye-catching`;
    } else if (slideNumber > 8) {
      return `${basePrompt}, conclusion slide, call to action visual, professional closing`;
    } else {
      return `${basePrompt}, informative content slide, clear message, professional`;
    }
  };

  // Geração via Edge Function
  const generateWithEdgeFunction = async (prompt: string, slideNumber: number): Promise<string> => {
    console.log(`🎨 Gerando imagem ${slideNumber} via Edge Function:`, prompt.substring(0, 100) + '...');
    
    const requestData = {
      slides: [{
        content: prompt,
        slideNumber: slideNumber,
        id: `slide-${slideNumber}`
      }],
      theme,
      style: selectedStyle as 'photographic' | 'illustration' | 'minimalist',
      provider: 'openai' as const
    };

    const { data, error } = await supabase.functions.invoke('generate-slide-images', {
      body: requestData
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(`Edge Function Error: ${error.message}`);
    }

    if (!data?.success || !data?.generatedImages?.[0]) {
      console.error('❌ Edge Function falhou:', data?.error);
      throw new Error(data?.error || 'Falha na geração de imagens');
    }

    return data.generatedImages[0].imageUrl;
  };

  // Upload de imagem para Supabase Storage
  const uploadImageToSupabase = async (imageUrl: string, fileName: string): Promise<string> => {
    console.log('📤 Fazendo upload da imagem para Supabase Storage...');
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Falha ao fazer download da imagem gerada');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('carousel-images')
      .upload(`ai-generated/${fileName}`, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      throw new Error(`Erro no upload para Supabase: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('carousel-images')
      .getPublicUrl(`ai-generated/${fileName}`);

    return publicUrl;
  };

  const handleGenerateImages = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para gerar imagens",
        variant: "destructive"
      });
      return;
    }

    if (slides.length === 0) {
      toast({
        title: "Slides necessários",
        description: "Primeiro crie conteúdo na aba Conteúdo",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentSlide(0);
    setProgress(0);
    setGeneratedImages([]);

    try {
      console.log('🚀 Iniciando geração direta de imagens:', {
        slides: slides.length,
        theme,
        style: selectedStyle,
        method: generationMethod
      });

      const results: GeneratedImage[] = [];
      const totalSlides = slides.length;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setCurrentSlide(i);
        setProgress((i / totalSlides) * 100);

        try {
          console.log(`\n🎯 Processando slide ${i + 1}/${totalSlides}...`);
          
          const prompt = generatePromptFromContent(slide.content || '', theme, selectedStyle, i + 1);
          console.log(`📝 Prompt gerado: ${prompt}`);

          // Inicializar status de geração
          const initialImage: GeneratedImage = {
            slideId: slide.id,
            slideNumber: i + 1,
            imageUrl: '',
            prompt,
            provider: 'openai',
            status: 'generating'
          };
          
          setGeneratedImages(prev => [...prev.filter(img => img.slideId !== slide.id), initialImage]);

          let imageUrl: string;
          
          if (generationMethod === 'direct') {
            // Geração via Edge Function
            imageUrl = await generateWithEdgeFunction(prompt, i + 1);
          } else {
            // Fallback para Edge Function
            imageUrl = await generateWithEdgeFunction(prompt, i + 1);
          }

          const finalImage: GeneratedImage = {
            ...initialImage,
            imageUrl,
            status: 'success'
          };

          results.push(finalImage);
          setGeneratedImages(prev => 
            prev.map(img => img.slideId === slide.id ? finalImage : img)
          );

          console.log(`✅ Slide ${i + 1} processado com sucesso`);

        } catch (error: any) {
          console.error(`❌ Falha no slide ${i + 1}:`, error.message);
          
          const errorImage: GeneratedImage = {
            slideId: slide.id,
            slideNumber: i + 1,
            imageUrl: '/placeholder.svg',
            prompt: generatePromptFromContent(slide.content || '', theme, selectedStyle, i + 1),
            provider: 'error',
            status: 'error'
          };
          
          setGeneratedImages(prev => 
            prev.map(img => img.slideId === slide.id ? errorImage : img)
          );
        }
      }

      setProgress(100);
      
      const successCount = results.filter(img => img.status === 'success').length;
      
      toast({
        title: successCount > 0 ? "Imagens geradas!" : "Erro na geração",
        description: successCount > 0 
          ? `${successCount} de ${slides.length} imagens foram criadas com sucesso`
          : "Não foi possível gerar nenhuma imagem. Verifique sua conexão e API key.",
        variant: successCount > 0 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('💥 Erro geral na geração:', error);
      toast({
        title: "Erro na geração de imagens",
        description: error.message || "Não foi possível gerar as imagens.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleApplyImages = () => {
    if (generatedImages.length === 0) {
      toast({
        title: "Nenhuma imagem para aplicar",
        description: "Gere as imagens primeiro",
        variant: "destructive"
      });
      return;
    }

    const imageUrls = generatedImages
      .sort((a, b) => a.slideNumber - b.slideNumber)
      .map(img => img.imageUrl);
    
    console.log('🖼️ Aplicando imagens aos slides:', imageUrls);
    onImagesApplied(imageUrls);
    
    toast({
      title: "Imagens aplicadas!",
      description: `${imageUrls.length} imagens foram aplicadas aos slides`
    });
  };

  const handleRegenerateSlide = async (slideNumber: number) => {
    // Implementar regeneração individual se necessário
    toast({
      title: "Em desenvolvimento",
      description: "Regeneração individual será implementada em breve"
    });
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      console.log('🔗 Testando webhook n8n:', webhookUrl);
      
      const testData = {
        action: 'generate_images',
        slides: slides.map((slide, index) => ({
          content: slide.content || '',
          slideNumber: index + 1,
          id: slide.id
        })),
        theme,
        style: selectedStyle,
        provider: selectedProvider,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Enviando dados para webhook:', testData);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testData)
      });

      console.log('📥 Resposta do webhook n8n:', response);
      
      toast({
        title: "Webhook testado!",
        description: "Dados enviados para n8n. Verifique os logs do n8n para ver o resultado.",
      });

    } catch (error: any) {
      console.error('❌ Erro ao testar webhook:', error);
      toast({
        title: "Erro no webhook",
        description: error.message || "Não foi possível conectar com o n8n",
        variant: "destructive"
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerador de Imagens com IA
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Crie imagens profissionais únicas para cada slide usando inteligência artificial
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Alerta sobre API Key se necessário */}
          <Alert className="border-warning/20 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              <strong>Importante:</strong> Para usar a geração direta, você precisa configurar sua API key do OpenAI nas configurações do Supabase.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground mb-2 block font-medium">Estilo Visual</Label>
              <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as any)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-popover-foreground hover:bg-accent">
                      <div>
                        <div className="font-medium">{style.example} {style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground mb-2 block font-medium">Método de Geração</Label>
              <Select value={generationMethod} onValueChange={(value) => setGenerationMethod(value as any)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="direct" className="text-popover-foreground hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Geração Direta (Recomendado)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edge_function" className="text-popover-foreground hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <span>Edge Function (Experimental)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Processando slide {currentSlide + 1} de {slides.length}
                </span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerateImages}
              disabled={isGenerating || slides.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-info hover:opacity-90 text-primary-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando imagens... ({currentSlide + 1}/{slides.length})
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar {slides.length} Imagens
                </>
              )}
            </Button>

            {generatedImages.length > 0 && (
              <Button 
                onClick={handleApplyImages}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar Todas ({generatedImages.filter(img => img.status === 'success').length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados das Imagens */}
      {generatedImages.length > 0 && (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span>Imagens Geradas ({generatedImages.length})</span>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  ✅ {generatedImages.filter(img => img.status === 'success').length} Sucesso
                </Badge>
                {generatedImages.filter(img => img.status === 'error').length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    ❌ {generatedImages.filter(img => img.status === 'error').length} Erros
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Preview das imagens criadas pela IA - clique para regenerar se necessário
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div key={image.slideId} className="space-y-3">
                  <div className="relative aspect-square bg-muted/20 rounded-lg overflow-hidden border border-border/50">
                    {image.status === 'generating' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Gerando...</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={image.imageUrl} 
                        alt={`Slide ${image.slideNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}
                    
                    {/* Status Indicator */}
                    <div className="absolute top-2 right-2">
                      {image.status === 'success' && (
                        <div className="bg-success/80 text-success-foreground p-1 rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="bg-destructive/80 text-destructive-foreground p-1 rounded-full">
                          <X className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm font-medium">
                        Slide {image.slideNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {image.provider}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {image.prompt}
                    </p>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateSlide(image.slideNumber)}
                      className="w-full text-xs"
                      disabled={image.status === 'generating'}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Regenerar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIImageGenerator;