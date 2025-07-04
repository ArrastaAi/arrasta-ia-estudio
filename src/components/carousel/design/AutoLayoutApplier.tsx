import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Eye, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SmartLayoutEngine, LayoutRecommendation } from './SmartLayoutEngine';
import { Slide } from '@/types/database.types';

interface AutoLayoutApplierProps {
  slides: Slide[];
  onLayoutsApplied: (layouts: { slideId: string; layout: LayoutRecommendation }[]) => void;
}

const AutoLayoutApplier: React.FC<AutoLayoutApplierProps> = ({
  slides,
  onLayoutsApplied
}) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedLayouts, setGeneratedLayouts] = useState<{ slideId: string; layout: LayoutRecommendation }[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const handleAutoLayout = async () => {
    if (slides.length === 0) {
      toast({
        title: "Nenhum slide encontrado",
        description: "Primeiro crie slides com imagens para aplicar layout automático",
        variant: "destructive"
      });
      return;
    }

    const slidesWithImages = slides.filter(slide => slide.image_url);
    if (slidesWithImages.length === 0) {
      toast({
        title: "Imagens necessárias",
        description: "Primeiro gere imagens para os slides na aba 'Geração de Imagens'",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setGeneratedLayouts([]);

    try {
      const layouts = await SmartLayoutEngine.applySmartLayout(
        slidesWithImages,
        (current, total) => {
          const progressPercent = Math.round((current / total) * 100);
          setProgress(progressPercent);
        }
      );

      setGeneratedLayouts(layouts);
      setPreviewMode(true);
      
      toast({
        title: "Layout automático gerado!",
        description: `${layouts.length} slides analisados e otimizados automaticamente`
      });

    } catch (error: any) {
      console.error('Erro ao aplicar layout automático:', error);
      toast({
        title: "Erro no layout automático",
        description: error.message || "Não foi possível analisar as imagens",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleApplyLayouts = () => {
    if (generatedLayouts.length > 0) {
      onLayoutsApplied(generatedLayouts);
      
      toast({
        title: "Layouts aplicados!",
        description: `Layout inteligente aplicado a ${generatedLayouts.length} slides`
      });
      
      setPreviewMode(false);
    }
  };

  const handleRegenerateLayout = async (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide?.image_url) return;

    try {
      const analysis = await SmartLayoutEngine.analyzeImage(slide.image_url);
      const layout = SmartLayoutEngine.generateLayoutRecommendation(
        analysis,
        slide.content?.length || 0
      );
      
      setGeneratedLayouts(prev => 
        prev.map(item => 
          item.slideId === slideId 
            ? { ...item, layout }
            : item
        )
      );

      toast({
        title: "Layout regenerado",
        description: "Nova análise aplicada ao slide"
      });

    } catch (error) {
      toast({
        title: "Erro ao regenerar",
        description: "Não foi possível analisar novamente a imagem",
        variant: "destructive"
      });
    }
  };

  const getPositionLabel = (position: string) => {
    const labels = {
      top: 'Superior',
      center: 'Centro',
      bottom: 'Inferior',
      left: 'Esquerda',
      right: 'Direita'
    };
    return labels[position as keyof typeof labels] || position;
  };

  const getPositionColor = (position: string) => {
    const colors = {
      top: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      center: 'bg-green-500/10 text-green-600 border-green-500/20',
      bottom: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      left: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      right: 'bg-pink-500/10 text-pink-600 border-pink-500/20'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Card Principal */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Layout Automático Inteligente
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Análise IA das imagens para posicionamento automático de texto com contraste perfeito
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Botão Principal */}
          <Button 
            onClick={handleAutoLayout}
            disabled={isAnalyzing || slides.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando imagens... {progress}%
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Aplicar Layout Automático ({slides.filter(s => s.image_url).length} slides)
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                🔍 Analisando contraste e posicionamento ideal...
              </p>
            </div>
          )}

          {/* Botões de Ação do Preview */}
          {previewMode && generatedLayouts.length > 0 && (
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyLayouts}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar Todos os Layouts
              </Button>
              
              <Button 
                onClick={() => setPreviewMode(false)}
                variant="outline"
                className="border-border/50"
              >
                <Eye className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview dos Layouts Gerados */}
      {previewMode && generatedLayouts.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">
              Preview dos Layouts ({generatedLayouts.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Análise inteligente aplicada - verifique antes de aplicar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-4">
              {generatedLayouts.map((item, index) => {
                const slide = slides.find(s => s.id === item.slideId);
                if (!slide) return null;

                return (
                  <div key={item.slideId} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
                    {/* Preview da Imagem */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {slide.image_url ? (
                        <img 
                          src={slide.image_url}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Sem imagem</span>
                        </div>
                      )}
                    </div>

                    {/* Informações do Layout */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          Slide {index + 1}
                        </span>
                        <Badge 
                          variant="outline"
                          className={getPositionColor(item.layout.textPosition)}
                        >
                          {getPositionLabel(item.layout.textPosition)}
                        </Badge>
                        {item.layout.overlayIntensity > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Overlay {item.layout.overlayIntensity}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Texto: {item.layout.textColor === 'light' ? 'Claro' : 'Escuro'}</span>
                        <span>•</span>
                        <span>Tamanho: {item.layout.fontSize}</span>
                        <span>•</span>
                        <span>Alinhamento: {item.layout.alignment}</span>
                      </div>
                    </div>

                    {/* Botão Regenerar */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerateLayout(item.slideId)}
                      className="border-border/50"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoLayoutApplier;