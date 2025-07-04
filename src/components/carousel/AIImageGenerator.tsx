import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Check, X, RefreshCw, Sparkles } from 'lucide-react';
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
    setGeneratedImages([]);

    try {
      const slidesData = slides.map((slide, index) => ({
        content: slide.content || '',
        slideNumber: index + 1,
        id: slide.id
      }));

      console.log('Generating images with data:', {
        slides: slidesData,
        theme,
        style: selectedStyle,
        provider: selectedProvider
      });

      const { data, error } = await supabase.functions.invoke('generate-slide-images', {
        body: {
          slides: slidesData,
          theme,
          style: selectedStyle,
          provider: selectedProvider
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Falha na geração de imagens');
      }

      console.log('🎉 Imagens geradas com sucesso:', data.generatedImages);
      setGeneratedImages(data.generatedImages);
      
      toast({
        title: "Imagens geradas com sucesso!",
        description: `${data.generatedImages.length} de ${slides.length} imagens foram criadas com IA`
      });

    } catch (error: any) {
      console.error('Error generating images:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Não foi possível gerar as imagens",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Gerador de Imagens com IA
          </CardTitle>
          <CardDescription className="text-gray-400">
            Use Gemini e OpenAI para criar imagens únicas para cada slide baseadas no conteúdo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Estilo Visual</Label>
              <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as any)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-white hover:bg-gray-600">
                      <div>
                        <div className="font-medium">{style.example} {style.label}</div>
                        <div className="text-xs text-gray-400">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Provedor IA</Label>
              <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as any)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value} className="text-white hover:bg-gray-600">
                      <div className="flex items-center gap-2">
                        <span>{provider.label}</span>
                        <Badge variant="secondary" className="text-xs">{provider.badge}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleGenerateImages}
              disabled={isGenerating || slides.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando imagens... ({currentSlide + 1}/{slides.length})
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar Imagens para {slides.length} Slides
                </>
              )}
            </Button>

            {generatedImages.length > 0 && (
              <Button 
                onClick={handleApplyImages}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar Todas
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-purple-300 text-sm text-center">
                🎨 IA trabalhando... Gerando imagem {currentSlide + 1} de {slides.length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Imagens Geradas ({generatedImages.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Preview das imagens criadas pela IA - aprove ou regenere conforme necessário
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div key={image.slideId} className="space-y-2">
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={image.imageUrl} 
                      alt={`Slide ${image.slideNumber}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">
                        Slide {image.slideNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {image.provider}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {image.prompt}
                    </p>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateSlide(image.slideNumber)}
                        className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Regenerar
                      </Button>
                    </div>
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