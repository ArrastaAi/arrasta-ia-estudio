import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, TextSelect, Image, LayoutTemplate, Palette, Share, FileText, Download, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Bug, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Slide } from "@/types/database.types";
import { db } from "@/integrations/firebase/client";
import { doc, getDoc, collection, query, orderBy, getDocs, setDoc, updateDoc, addDoc } from "firebase/firestore";
import CarouselPreview from "@/components/carousel/CarouselPreview";
import ContentTab from "@/components/carousel/ContentTab";
import ImagesTab from "@/components/carousel/ImagesTab";
import LayoutTab from "@/components/carousel/LayoutTab";
import TextStylesTab from "@/components/carousel/TextStylesTab";
import { TextStyleOptions } from "@/types/carousel.types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [activeTab, setActiveTab] = useState("images");
  const [debugInfo, setDebugInfo] = useState<any>({});

  const MIN_SLIDES = 4;
  const MAX_SLIDES = 9;

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
      if (!id || !user) {
        console.log('[Editor] Dados insuficientes:', { id, user: !!user });
        return;
      }
      
      try {
        setLoading(true);
        console.log('[Editor] Iniciando carregamento do carrossel:', {
          carousel_id: id,
          user_id: user.uid,
          timestamp: new Date().toISOString()
        });

        const carouselDocRef = doc(db, "carousels", id);
        const carouselDocSnap = await getDoc(carouselDocRef);

        console.log('[Editor] Resultado da busca do carrossel:', {
          exists: carouselDocSnap.exists(),
          id: carouselDocSnap.id,
          has_data: !!carouselDocSnap.data()
        });

        if (!carouselDocSnap.exists()) {
          console.log('[Editor] Carrossel não encontrado');
          toast({
            title: "Carrossel não encontrado",
            description: "Este carrossel não existe ou você não tem permissão para acessá-lo.",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }

        const carouselData = carouselDocSnap.data() as CarouselData;
        console.log('[Editor] Dados do carrossel carregados:', {
          title: carouselData.title,
          layout_type: carouselData.layout_type,
          has_content: !!carouselData.content
        });

        const slidesCollectionRef = collection(db, "carousels", id, "slides");
        const slidesQuery = query(slidesCollectionRef, orderBy("order_index", "asc"));
        const slidesQuerySnapshot = await getDocs(slidesQuery);

        console.log('[Editor] Resultado da busca de slides:', {
          slides_count: slidesQuerySnapshot.docs.length,
          empty: slidesQuerySnapshot.empty
        });

        const slidesData: Slide[] = slidesQuerySnapshot.docs.map(doc => {
          const slideData = doc.data();
          console.log('[Editor] Slide carregado:', {
            id: doc.id,
            order_index: slideData.order_index,
            has_content: !!slideData.content,
            has_image: !!slideData.image_url
          });
          
          return {
            id: doc.id,
            ...slideData
          } as Slide;
        });

        setCarouselData({
          id,
          ...carouselData,
          slides: slidesData
        });

        setDebugInfo({
          carousel_id: id,
          slides_count: slidesData.length,
          load_success: true,
          loaded_at: new Date().toISOString()
        });

        console.log('[Editor] Carrossel carregado com sucesso:', {
          slides_count: slidesData.length,
          title: carouselData.title
        });

      } catch (error: any) {
        console.error("[Editor] Erro detalhado ao buscar dados do carrossel:", {
          error: error,
          message: error?.message,
          code: error?.code,
          carousel_id: id,
          user_id: user.uid
        });

        setDebugInfo({
          carousel_id: id,
          error: error?.message || 'Erro desconhecido',
          load_success: false,
          loaded_at: new Date().toISOString()
        });

        toast({
          title: "Erro",
          description: `Erro ao buscar carrossel: ${error.message || "Erro desconhecido"}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [id, user, navigate, toast]);

  const handleSaveCarousel = async () => {
    if (!carouselData || !user) {
      console.log('[Editor] Dados insuficientes para salvar:', {
        hasCarouselData: !!carouselData,
        hasUser: !!user
      });
      return;
    }
    
    // Validar número mínimo de slides antes de salvar
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
      console.log('[Editor] Iniciando salvamento do carrossel:', {
        carousel_id: carouselData.id,
        slides_count: carouselData.slides.length,
        timestamp: new Date().toISOString()
      });
      
      // Salvar carrossel principal - filtrar campos undefined
      const carouselRef = doc(db, "carousels", carouselData.id);
      const carouselUpdateData: any = {
        updated_at: new Date().toISOString()
      };

      // Adicionar apenas campos que não são undefined
      if (carouselData.title !== undefined) {
        carouselUpdateData.title = carouselData.title;
      }
      if (carouselData.description !== undefined) {
        carouselUpdateData.description = carouselData.description;
      }
      if (carouselData.layout_type !== undefined) {
        carouselUpdateData.layout_type = carouselData.layout_type;
      }
      if (carouselData.narrative_style !== undefined) {
        carouselUpdateData.narrative_style = carouselData.narrative_style;
      }
      if (carouselData.content !== undefined) {
        carouselUpdateData.content = carouselData.content;
      }

      console.log('[Editor] Salvando dados do carrossel:', carouselUpdateData);
      await updateDoc(carouselRef, carouselUpdateData);

      // Salvar slides - também filtrar campos undefined
      let slidesUpdated = 0;
      for (const slide of carouselData.slides) {
        try {
          const slideRef = doc(db, "carousels", carouselData.id, "slides", slide.id);
          const slideUpdateData: any = {
            updated_at: new Date().toISOString()
          };

          // Adicionar apenas campos que não são undefined
          if (slide.content !== undefined) {
            slideUpdateData.content = slide.content;
          }
          if (slide.image_url !== undefined) {
            slideUpdateData.image_url = slide.image_url;
          }
          if (slide.background_type !== undefined) {
            slideUpdateData.background_type = slide.background_type;
          }
          if (slide.background_value !== undefined) {
            slideUpdateData.background_value = slide.background_value;
          }
          if (slide.effects !== undefined) {
            slideUpdateData.effects = slide.effects;
          }

          console.log('[Editor] Salvando slide:', {
            slide_id: slide.id,
            order_index: slide.order_index,
            fields_to_update: Object.keys(slideUpdateData)
          });

          await updateDoc(slideRef, slideUpdateData);
          slidesUpdated++;
        } catch (slideError) {
          console.error('[Editor] Erro ao salvar slide:', {
            slide_id: slide.id,
            error: slideError
          });
        }
      }

      console.log('[Editor] Salvamento concluído:', {
        carousel_saved: true,
        slides_updated: slidesUpdated,
        total_slides: carouselData.slides.length
      });

      setDebugInfo(prev => ({
        ...prev,
        last_save: new Date().toISOString(),
        save_success: true,
        slides_saved: slidesUpdated
      }));

      toast({
        title: "Carrossel salvo",
        description: `Carrossel e ${slidesUpdated} slides salvos com sucesso.`
      });
    } catch (error) {
      console.error("[Editor] Erro ao salvar carrossel:", {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        carousel_id: carouselData.id
      });

      setDebugInfo(prev => ({
        ...prev,
        last_save: new Date().toISOString(),
        save_success: false,
        save_error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
      
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar o carrossel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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

      // Salvar no Firestore
      try {
        const slideRef = doc(db, "carousels", carouselData.id, "slides", updatedSlides[index].id);
        await updateDoc(slideRef, {
          content: content,
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error("Erro ao atualizar slide:", error);
      }
    }
  };

  const handleApplyGeneratedTexts = async (texts: { id: number; text: string }[]) => {
    if (!carouselData || !user) return;

    try {
      const updatedSlides = [...carouselData.slides];
      
      // Garantir que temos pelo menos o mínimo de slides
      const targetSlideCount = Math.max(texts.length, MIN_SLIDES);
      
      // Criar slides se necessário
      while (updatedSlides.length < targetSlideCount) {
        const newSlideRef = doc(collection(db, "carousels", carouselData.id, "slides"));
        const newSlide: Slide = {
          id: newSlideRef.id,
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
        
        await setDoc(newSlideRef, newSlide);
        updatedSlides.push(newSlide);
      }

      // Aplicar textos aos slides
      for (let i = 0; i < texts.length; i++) {
        if (updatedSlides[i]) {
          updatedSlides[i].content = texts[i].text;
          
          const slideRef = doc(db, "carousels", carouselData.id, "slides", updatedSlides[i].id);
          await updateDoc(slideRef, {
            content: texts[i].text,
            updated_at: new Date().toISOString()
          });
        }
      }

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });

      toast({
        title: "Textos aplicados",
        description: `${texts.length} textos foram aplicados aos slides. Total de slides: ${updatedSlides.length}`
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
      
      // Aplicar imagens aos slides existentes
      for (let i = 0; i < Math.min(imageUrls.length, updatedSlides.length); i++) {
        updatedSlides[i].image_url = imageUrls[i];
        
        const slideRef = doc(db, "carousels", carouselData.id, "slides", updatedSlides[i].id);
        await updateDoc(slideRef, {
          image_url: imageUrls[i],
          updated_at: new Date().toISOString()
        });
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
      toast({
        title: "Erro",
        description: "Não foi possível aplicar as imagens.",
        variant: "destructive"
      });
    }
  };

  const handleApplyImageToSlide = async (imageUrl: string, slideIndex: number) => {
    if (!carouselData || slideIndex >= carouselData.slides.length) return;

    try {
      const updatedSlides = [...carouselData.slides];
      updatedSlides[slideIndex].image_url = imageUrl;

      const slideRef = doc(db, "carousels", carouselData.id, "slides", updatedSlides[slideIndex].id);
      await updateDoc(slideRef, {
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      });

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

      // Atualizar no Firestore
      for (const slide of updatedSlides) {
        const slideRef = doc(db, "carousels", carouselData.id, "slides", slide.id);
        await updateDoc(slideRef, {
          background_type: "color",
          background_value: color,
          updated_at: new Date().toISOString()
        });
      }

      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
    } catch (error) {
      console.error("Erro ao alterar cor de fundo:", error);
    }
  };

  const handleSlideCountChange = async (count: number) => {
    if (!carouselData || !user) return;

    // Validar limites
    const validCount = Math.max(MIN_SLIDES, Math.min(count, MAX_SLIDES));

    if (validCount !== count) {
      toast({
        title: "Número de slides ajustado",
        description: `O número foi ajustado para ${validCount} (limite: ${MIN_SLIDES}-${MAX_SLIDES}).`,
        variant: "default"
      });
    }

    try {
      const currentSlides = [...carouselData.slides];
      
      if (validCount > currentSlides.length) {
        // Adicionar slides
        for (let i = currentSlides.length; i < validCount; i++) {
          const newSlideRef = doc(collection(db, "carousels", carouselData.id, "slides"));
          const newSlide: Slide = {
            id: newSlideRef.id,
            carousel_id: carouselData.id,
            order_index: i,
            content: "",
            image_url: null,
            background_type: "color",
            background_value: "#000000",
            effects: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          await setDoc(newSlideRef, newSlide);
          currentSlides.push(newSlide);
        }
      } else if (validCount < currentSlides.length) {
        // Remover slides extras (mantém apenas os primeiros 'validCount' slides)
        currentSlides.splice(validCount);
      }

      setCarouselData({
        ...carouselData,
        slides: currentSlides
      });

      toast({
        title: "Slides atualizados",
        description: `Carrossel agora tem ${validCount} slides.`
      });
    } catch (error) {
      console.error("Erro ao alterar número de slides:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o número de slides.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLayout = async (layoutType: string) => {
    if (!carouselData) return;

    try {
      const carouselRef = doc(db, "carousels", carouselData.id);
      await updateDoc(carouselRef, {
        layout_type: layoutType,
        updated_at: new Date().toISOString()
      });

      setCarouselData({
        ...carouselData,
        layout_type: layoutType
      });
    } catch (error) {
      console.error("Erro ao atualizar layout:", error);
    }
  };

  const handleUpdateTextStyles = (styles: TextStyleOptions) => {
    console.log('[Editor] Recebendo atualização de estilos de texto:', styles);
    setTextStyles(styles);
  };

  const captureSlide = async (slideElement: HTMLElement): Promise<string> => {
    const canvas = await html2canvas(slideElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#000000"
    });
    return canvas.toDataURL('image/png');
  };

  const handleExport = async (format: string) => {
    try {
      toast({
        title: `Exportando para ${format}`,
        description: `Preparando seus slides para exportação no formato ${format}.`
      });

      const slideElements = document.querySelectorAll('.carousel-container [data-carousel-item], [data-carousel-content] > div > div');
      if (!slideElements || slideElements.length === 0) {
        const carouselElement = document.querySelector('.carousel-container, [role="region"]') as HTMLElement;
        if (!carouselElement) {
          throw new Error("Não foi possível encontrar o elemento do carrossel");
        }

        const dataUrl = await captureSlide(carouselElement);

        if (format === 'PNG' || format === 'JPG') {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `carrossel_${carouselData?.title || 'sem-titulo'}.${format.toLowerCase()}`;
          link.click();
        } else if (format === 'PDF') {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
          });
          const imgWidth = 190;
          const imgHeight = imgWidth * 4 / 5;

          pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save(`carrossel_${carouselData?.title || 'sem-titulo'}.pdf`);
        }
      } else {
        const slideImages: string[] = [];
        for (let i = 0; i < slideElements.length; i++) {
          const dataUrl = await captureSlide(slideElements[i] as HTMLElement);
          slideImages.push(dataUrl);
        }

        if (format === 'PNG' || format === 'JPG') {
          const link = document.createElement('a');
          link.href = slideImages[0];
          link.download = `carrossel_slide_1.${format.toLowerCase()}`;
          link.click();
          if (slideImages.length > 1) {
            toast({
              title: "Exportação parcial",
              description: `Exportado apenas o primeiro slide. Para exportar todos os slides, escolha o formato PDF.`,
              variant: "default"
            });
          }
        } else if (format === 'PDF') {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm'
          });
          const imgWidth = 190;
          const imgHeight = imgWidth * 4 / 5;

          slideImages.forEach((img, index) => {
            if (index > 0) {
              pdf.addPage();
            }
            pdf.addImage(img, 'PNG', 10, 10, imgWidth, imgHeight);
          });
          pdf.save(`carrossel_${carouselData?.title || 'sem-titulo'}.pdf`);
        }
      }
      toast({
        title: "Exportação concluída",
        description: `Seus slides foram exportados com sucesso no formato ${format}.`
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o carrossel. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (platform: string) => {
    try {
      toast({
        title: `Compartilhando para ${platform}`,
        description: `Preparando para compartilhar no ${platform}.`
      });

      const carouselElement = document.querySelector('.carousel-container, [role="region"]') as HTMLElement;
      if (!carouselElement) {
        throw new Error("Não foi possível encontrar o elemento do carrossel");
      }

      const dataUrl = await captureSlide(carouselElement);

      switch (platform) {
        case 'WhatsApp':
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira este carrossel: ${carouselData?.title || 'Sem título'}`)}`, '_blank');
          break;
        case 'Facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
          break;
        case 'Twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira este carrossel: ${carouselData?.title || 'Sem título'}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
          break;
        case 'LinkedIn':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
          break;
        case 'Instagram':
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `carrossel_instagram.png`;
          link.click();
          toast({
            title: "Imagem salva para Instagram",
            description: "A imagem foi salva. Você pode carregá-la manualmente no Instagram.",
            variant: "default"
          });
      }
      toast({
        title: "Compartilhamento iniciado",
        description: `O processo de compartilhamento para ${platform} foi iniciado.`
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({
        title: "Erro no compartilhamento",
        description: "Não foi possível compartilhar o carrossel. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>;
  }

  if (!carouselData) {
    return <MainLayout>
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Carrossel não encontrado</h2>
          <p className="text-gray-400 mb-6">
            O carrossel que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </MainLayout>;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button variant="ghost" className="text-gray-400 hover:text-white mr-4" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">
                    {carouselData.title || "Carrossel sem título"}
                  </h1>
                  {debugInfo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('[DEBUG INFO]', debugInfo)}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Ver informações de debug no console"
                    >
                      <Bug className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-400 text-sm">
                    {carouselData.layout_type === "feed_square" ? "Instagram/LinkedIn (Quadrado)" : 
                     carouselData.layout_type === "stories" ? "Instagram/TikTok (Stories)" : 
                     carouselData.layout_type === "pinterest" ? "Pinterest" : "Facebook"}
                  </p>
                  {debugInfo.slides_count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {debugInfo.slides_count} slides
                    </Badge>
                  )}
                  {carouselData && carouselData.slides.length < MIN_SLIDES && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Mín. {MIN_SLIDES} slides
                    </Badge>
                  )}
                  {debugInfo.save_success === false && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Erro ao salvar
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveCarousel} 
                disabled={saving || (carouselData && carouselData.slides.length < MIN_SLIDES)} 
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
                    {carouselData && carouselData.slides.length < MIN_SLIDES && " (Mín. 4 slides)"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {debugInfo && Object.keys(debugInfo).length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">Debug Status</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Carregamento:</span>
                    <Badge variant={debugInfo.load_success ? "default" : "destructive"} className="ml-2">
                      {debugInfo.load_success ? "Sucesso" : "Erro"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Slides:</span>
                    <span className="text-white ml-2">
                      {debugInfo.slides_count || 0} 
                      {debugInfo.slides_count < MIN_SLIDES && (
                        <span className="text-red-400"> (Mín: {MIN_SLIDES})</span>
                      )}
                    </span>
                  </div>
                  {debugInfo.last_save && (
                    <div>
                      <span className="text-gray-400">Último Save:</span>
                      <Badge variant={debugInfo.save_success ? "default" : "destructive"} className="ml-2">
                        {debugInfo.save_success ? "OK" : "Erro"}
                      </Badge>
                    </div>
                  )}
                  {debugInfo.error && (
                    <div className="col-span-2 lg:col-span-1">
                      <span className="text-gray-400">Erro:</span>
                      <p className="text-red-400 text-xs">{debugInfo.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-gray-800 rounded-lg p-1 mb-6">
              <TabsList className="grid grid-cols-5 bg-transparent py-[3px] mx-0 px-0">
                <TabsTrigger value="images" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <Image className="mr-2 h-4 w-4" />
                  Imagens
                </TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <TextSelect className="mr-2 h-4 w-4" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="layout" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <Palette className="mr-2 h-4 w-4" />
                  Estilo de texto
                </TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  <Share className="mr-2 h-4 w-4" />
                  Exportar
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className={`col-span-12 ${activeTab === 'content' ? 'hidden' : 'lg:col-span-7'}`}>
                <CarouselPreview 
                  slides={carouselData?.slides || []} 
                  layoutType={carouselData?.layout_type || "instagram_rect"} 
                  textStyles={textStyles} 
                  hidePreview={activeTab === 'content'} 
                />
              </div>

              <div className={`col-span-12 ${activeTab === 'content' ? 'max-w-3xl mx-auto' : 'lg:col-span-5'}`}>
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-6">
                    <TabsContent value="images" className="mt-0">
                      <ImagesTab 
                        carouselId={carouselData?.id || ""} 
                        onImagesUploaded={handleImagesUploaded} 
                        onSelectImage={handleApplyImageToSlide} 
                        onBackgroundColorChange={handleBackgroundColorChange} 
                        onSlideCountChange={handleSlideCountChange} 
                      />
                    </TabsContent>
                    <TabsContent value="content" className="mt-0">
                      <ContentTab 
                        carouselId={carouselData?.id || ""} 
                        slides={carouselData?.slides || []} 
                        onApplyGeneratedTexts={handleApplyGeneratedTexts} 
                        onUpdateSlideContent={handleUpdateSlideContent} 
                      />
                    </TabsContent>
                    <TabsContent value="layout" className="mt-0">
                      <LayoutTab 
                        layoutType={carouselData?.layout_type || "instagram_rect"} 
                        onUpdateLayout={handleUpdateLayout} 
                        textStyles={textStyles} 
                        onUpdateTextStyles={handleUpdateTextStyles} 
                      />
                    </TabsContent>
                    <TabsContent value="style" className="mt-0">
                      <TextStylesTab 
                        textStyles={textStyles}
                        onUpdateTextStyles={handleUpdateTextStyles}
                      />
                    </TabsContent>
                    <TabsContent value="export" className="mt-0">
                      <div className="space-y-6">
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-white text-lg font-semibold mb-3">Exportar para</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleExport('PNG')}>
                                <Image className="h-6 w-6 mb-2" />
                                <span>PNG</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleExport('PDF')}>
                                <FileText className="h-6 w-6 mb-2" />
                                <span>PDF</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleExport('JPG')}>
                                <Download className="h-6 w-6 mb-2" />
                                <span>JPG</span>
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-white text-lg font-semibold mb-3">Compartilhar em</h3>
                            <div className="grid grid-cols-3 gap-3">
                              <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleShare('WhatsApp')}>
                                <MessageCircle className="h-5 w-5 mb-1" />
                                <span>WhatsApp</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleShare('Instagram')}>
                                <Instagram className="h-5 w-5 mb-1" />
                                <span>Instagram</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleShare('Facebook')}>
                                <Facebook className="h-5 w-5 mb-1" />
                                <span>Facebook</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleShare('LinkedIn')}>
                                <Linkedin className="h-5 w-5 mb-1" />
                                <span>LinkedIn</span>
                              </Button>
                              <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => handleShare('Twitter')}>
                                <Twitter className="h-5 w-5 mb-1" />
                                <span>Twitter</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Editor;
