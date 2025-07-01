import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Palette, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Slide } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";
import ContentTab from "@/components/carousel/ContentTab";
import DesignTab from "@/components/carousel/DesignTab";
import ExportTab from "@/components/carousel/ExportTab";
import { TextStyleOptions } from "@/types/carousel.types";
import { useStreamingGeneration } from "@/hooks/useStreamingGeneration";

interface CarouselData {
  id: string;
  title: string;
  description: string | null;
  layout_type: string;
  narrative_style: string | null;
  content: string | null;
  slides: Slide[];
}

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  
  // Hook de streaming para comunicação com o ContentTab
  const streamingState = useStreamingGeneration();

  const MIN_SLIDES = 4;
  const MAX_SLIDES = 12;

  const [textStyles, setTextStyles] = useState<TextStyleOptions>({
    textSize: "medium",
    textPosition: "center",
    textStyle: "minimal",
    textColor: "#FFFFFF",
    fontFamily: "helvetica",
    hasBackground: false,
    backgroundColor: "#000000",
    backgroundOpacity: 50,
    alignment: "center",
    fontSize: 18,
    hasOutline: false,
    outlineColor: "#ffffff",
    outlineWidth: 1,
    textHierarchy: "primary",
    fontWeight: "regular",
    brandStyle: "arrastaai_minimal",
    useIntelligentPositioning: true,
    overlayIntensity: 0,
    textCase: "none",
    letterSpacing: 0.02
  });

  useEffect(() => {
    const fetchCarouselData = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);

        const { data: carouselData, error: carouselError } = await supabase
          .from('carousels')
          .select('*')
          .eq('id', id)
          .single();

        if (carouselError || !carouselData) {
          toast({
            title: "Carrossel não encontrado",
            description: "Este carrossel não existe ou você não tem permissão para acessá-lo.",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }

        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .eq('carousel_id', id)
          .order('order_index', { ascending: true });

        const slides: Slide[] = (slidesData || []).map(slide => ({
          ...slide,
          effects: (slide.effects as Record<string, any>) || {}
        } as Slide));

        setCarouselData({
          id,
          ...carouselData,
          slides: slides
        });

      } catch (error: any) {
        console.error("Erro ao buscar carrossel:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar carrossel.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [id, user, navigate, toast]);

  const handleSaveCarousel = async () => {
    if (!carouselData || !user) return;
    
    if (carouselData.slides.length < MIN_SLIDES) {
      toast({
        title: "Slides insuficientes",
        description: `É necessário ter pelo menos ${MIN_SLIDES} slides para salvar o carrossel.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const { error: carouselError } = await supabase
        .from('carousels')
        .update({
          title: carouselData.title,
          description: carouselData.description,
          layout_type: carouselData.layout_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', carouselData.id);

      if (carouselError) throw carouselError;

      for (const slide of carouselData.slides) {
        const { error: slideError } = await supabase
          .from('slides')
          .update({
            content: slide.content,
            image_url: slide.image_url,
            background_type: slide.background_type,
            background_value: slide.background_value,
            effects: slide.effects,
            updated_at: new Date().toISOString()
          })
          .eq('id', slide.id);

        if (slideError) throw slideError;
      }

      toast({
        title: "Carrossel salvo",
        description: "Carrossel salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o carrossel.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlideContent = async (index: number, content: string) => {
    if (!carouselData) return;

    const updatedSlides = [...carouselData.slides];
    if (updatedSlides[index]) {
      updatedSlides[index].content = content;
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });

      try {
        await supabase
          .from('slides')
          .update({
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedSlides[index].id);
      } catch (error) {
        console.error("Erro ao atualizar slide:", error);
      }
    }
  };

  const handleApplyGeneratedTexts = async (texts: { id: number; text: string }[]) => {
    if (!carouselData || !user) return;

    try {
      const updatedSlides = [...carouselData.slides];
      
      const targetSlideCount = Math.max(texts.length, MIN_SLIDES);
      const limitedSlideCount = Math.min(targetSlideCount, MAX_SLIDES);
      
      while (updatedSlides.length < limitedSlideCount) {
        const newSlide: Omit<Slide, 'id'> = {
          carousel_id: carouselData.id,
          order_index: updatedSlides.length,
          content: "",
          image_url: null,
          background_type: "color",
          background_value: "#000000",
          effects: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: insertedSlide, error } = await supabase
          .from('slides')
          .insert(newSlide)
          .select()
          .single();

        if (error) throw error;
        
        const slideWithCorrectTypes: Slide = {
          ...insertedSlide,
          effects: (insertedSlide.effects as Record<string, any>) || {}
        };
        
        updatedSlides.push(slideWithCorrectTypes);
      }

      for (let i = 0; i < Math.min(texts.length, MAX_SLIDES); i++) {
        if (updatedSlides[i]) {
          updatedSlides[i].content = texts[i].text;
          
          await supabase
            .from('slides')
            .update({
              content: texts[i].text,
              updated_at: new Date().toISOString()
            })
            .eq('id', updatedSlides[i].id);
        }
      }

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });

      toast({
        title: "Textos aplicados",
        description: `${Math.min(texts.length, MAX_SLIDES)} textos foram aplicados aos slides.`
      });
    } catch (error) {
      console.error("Erro ao aplicar textos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar os textos gerados.",
        variant: "destructive"
      });
    }
  };

  const handleImagesUploaded = async (imageUrls: string[]) => {
    if (!carouselData || !user) return;

    try {
      const updatedSlides = [...carouselData.slides];
      
      for (let i = 0; i < Math.min(imageUrls.length, updatedSlides.length); i++) {
        updatedSlides[i].image_url = imageUrls[i];
        
        await supabase
          .from('slides')
          .update({
            image_url: imageUrls[i],
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedSlides[i].id);
      }

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });

      toast({
        title: "Imagens aplicadas",
        description: `${Math.min(imageUrls.length, updatedSlides.length)} imagens foram aplicadas aos slides.`
      });
    } catch (error) {
      console.error("Erro ao aplicar imagens:", error);
    }
  };

  const handleApplyImageToSlide = async (imageUrl: string, slideIndex: number) => {
    if (!carouselData || slideIndex >= carouselData.slides.length) return;

    try {
      const updatedSlides = [...carouselData.slides];
      updatedSlides[slideIndex].image_url = imageUrl;

      await supabase
        .from('slides')
        .update({
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedSlides[slideIndex].id);

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });

      toast({
        title: "Imagem aplicada",
        description: `Imagem aplicada ao slide ${slideIndex + 1}.`
      });
    } catch (error) {
      console.error("Erro ao aplicar imagem:", error);
    }
  };

  const handleBackgroundColorChange = async (color: string) => {
    if (!carouselData) return;

    try {
      const updatedSlides = carouselData.slides.map(slide => ({
        ...slide,
        background_type: "color",
        background_value: color
      }));

      for (const slide of updatedSlides) {
        await supabase
          .from('slides')
          .update({
            background_type: "color",
            background_value: color,
            updated_at: new Date().toISOString()
          })
          .eq('id', slide.id);
      }

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
    } catch (error) {
      console.error("Erro ao alterar cor de fundo:", error);
    }
  };

  const handleUpdateTextStyles = (styles: TextStyleOptions) => {
    setTextStyles(styles);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (!carouselData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Carrossel não encontrado</h2>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-white mr-4" 
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {carouselData.title || "Carrossel sem título"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {carouselData.slides.length} slides
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSaveCarousel} 
              disabled={saving || carouselData.slides.length < MIN_SLIDES} 
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> 
                  Salvar
                </>
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-gray-800 rounded-lg p-1 mb-6">
              <TabsList className="grid grid-cols-3 bg-transparent py-[3px] mx-0 px-0">
                <TabsTrigger value="content" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <Edit className="mr-2 h-4 w-4" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="design" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <Palette className="mr-2 h-4 w-4" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar
                </TabsTrigger>
              </TabsList>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <TabsContent value="content" className="mt-0">
                  <ContentTab 
                    carouselId={carouselData?.id || ""} 
                    slides={carouselData?.slides || []} 
                    onApplyGeneratedTexts={handleApplyGeneratedTexts} 
                    onUpdateSlideContent={handleUpdateSlideContent}
                    streamingState={{
                      isStreaming: streamingState.isStreaming,
                      slides: streamingState.slides,
                      progress: streamingState.progress
                    }}
                  />
                </TabsContent>
                <TabsContent value="design" className="mt-0">
                  <DesignTab 
                    carouselId={carouselData?.id || ""} 
                    onImagesUploaded={handleImagesUploaded} 
                    onSelectImage={handleApplyImageToSlide} 
                    onBackgroundColorChange={handleBackgroundColorChange}
                    textStyles={textStyles}
                    onUpdateTextStyles={handleUpdateTextStyles}
                  />
                </TabsContent>
                <TabsContent value="export" className="mt-0">
                  <ExportTab carouselTitle={carouselData?.title} />
                </TabsContent>
              </div>
            </Card>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Editor;
