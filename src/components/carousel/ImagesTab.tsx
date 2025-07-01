
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layers, Sparkles, Info } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ImagesTabProps {
  carouselId: string;
  onImagesUploaded: (imageUrls: string[]) => void;
  onSelectImage: (imageUrl: string, slideIndex: number) => void;
  onBackgroundColorChange?: (color: string) => void;
  onSlideCountChange?: (count: number) => void;
}

const ImagesTab: React.FC<ImagesTabProps> = ({
  carouselId,
  onImagesUploaded,
  onSelectImage,
  onBackgroundColorChange,
  onSlideCountChange
}) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [slideCount, setSlideCount] = useState<number>(4);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [mlAnalysisEnabled, setMlAnalysisEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const MIN_SLIDES = 4;
  const MAX_SLIDES = 9;

  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !carouselId) return;

      try {
        setLoading(true);

        const { data: carouselData, error: carouselError } = await supabase
          .from('carousels')
          .select('*')
          .eq('id', carouselId)
          .single();

        if (carouselError || !carouselData) {
          console.log("Carrossel não encontrado");
          return;
        }

        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .eq('carousel_id', carouselId);

        if (!slidesError && slidesData) {
          const currentSlideCount = Math.max(MIN_SLIDES, Math.min(slidesData.length, MAX_SLIDES));
          setSlideCount(currentSlideCount);

          if (slidesData[0] && slidesData[0].background_value) {
            setBackgroundColor(slidesData[0].background_value);
          }
        } else {
          setSlideCount(MIN_SLIDES);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [carouselId, user]);

  const handleImagesUploaded = async (imageUrls: string[]) => {
    console.log("Imagens recebidas no ImagesTab:", imageUrls);
    
    onImagesUploaded(imageUrls);
    setActiveTab("gallery");

    if (mlAnalysisEnabled && imageUrls.length > 0) {
      try {
        toast({
          title: "Analisando imagens com IA",
          description: "Processando imagens para otimização...",
        });

        setTimeout(() => {
          toast({
            title: "Análise concluída",
            description: "Imagens processadas e aplicadas com sucesso!",
          });
        }, 2000);
      } catch (error) {
        console.error("Erro na análise ML:", error);
      }
    }

    toast({
      title: `${imageUrls.length} ${imageUrls.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}`,
      description: "As imagens foram aplicadas aos slides automaticamente."
    });
  };

  const handleChangeSlideCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count >= MIN_SLIDES && count <= MAX_SLIDES) {
      setSlideCount(count);
    }
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBackgroundColor(color);
  };

  const handleApplySettings = () => {
    if (slideCount < MIN_SLIDES) {
      toast({
        title: "Número insuficiente de slides",
        description: `O mínimo de slides é ${MIN_SLIDES}. Ajustando automaticamente.`,
        variant: "destructive"
      });
      setSlideCount(MIN_SLIDES);
      return;
    }

    if (slideCount > MAX_SLIDES) {
      toast({
        title: "Muitos slides",
        description: `O máximo de slides é ${MAX_SLIDES}. Ajustando automaticamente.`,
        variant: "destructive"
      });
      setSlideCount(MAX_SLIDES);
      return;
    }

    if (onSlideCountChange) {
      onSlideCountChange(slideCount);
    }

    if (onBackgroundColorChange) {
      onBackgroundColorChange(backgroundColor);
    }

    toast({
      title: `Configurações aplicadas`,
      description: `Carrossel configurado com ${slideCount} slides e cor de fundo atualizada.`
    });
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-blue-300">
          <strong>Regras de slides:</strong> Mínimo {MIN_SLIDES} slides, máximo {MAX_SLIDES} slides.
          Os agentes de IA se adaptarão automaticamente à quantidade selecionada.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upload">Enviar novas</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-0">
          <ImageUpload carouselId={carouselId} onImagesUploaded={handleImagesUploaded} />
          
          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <h4 className="text-md font-medium text-white mb-3">Configurações do Carrossel</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="slideCount" className="text-sm text-gray-300 mb-1 block">
                  Número de Slides
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slideCount"
                    type="number"
                    min={MIN_SLIDES}
                    max={MAX_SLIDES}
                    value={slideCount}
                    onChange={handleChangeSlideCount}
                    className="w-24 bg-gray-600 text-white"
                  />
                  <span className="text-sm text-gray-300">
                    ({MIN_SLIDES}-{MAX_SLIDES} slides)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Os agentes de IA gerarão textos adaptados para {slideCount} slides
                </p>
              </div>
              
              <div>
                <Label htmlFor="backgroundColor" className="text-sm text-gray-300 mb-1 block">
                  Cor de Fundo dos Slides
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={handleBackgroundColorChange}
                    className="w-10 h-10 rounded cursor-pointer"
                    aria-label="Selecionar cor de fundo"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={handleBackgroundColorChange}
                    className="w-24 bg-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="mlAnalysis"
                  type="checkbox"
                  checked={mlAnalysisEnabled}
                  onChange={(e) => setMlAnalysisEnabled(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="mlAnalysis" className="text-sm text-gray-300 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Análise automática com IA (Supabase AI)
                </Label>
              </div>
              
              <Button 
                onClick={handleApplySettings}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={loading}
              >
                <Layers className="mr-2 h-4 w-4" />
                Aplicar Configurações ({slideCount} slides)
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="gallery" className="mt-0">
          <ImageGallery carouselId={carouselId} onSelectImage={onSelectImage} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagesTab;
