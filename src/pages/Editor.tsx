import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, TextSelect, Image, LayoutTemplate, Palette, Share, FileText, Download, MessageCircle, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Slide } from "@/types/database.types";
import { db, firestore } from "@/integrations/firebase/client";
import { doc, getDoc, collection, query, where, getDocs, orderBy, setDoc, updateDoc, addDoc } from "firebase/firestore";
import CarouselPreview from "@/components/carousel/CarouselPreview";
import ContentTab from "@/components/carousel/ContentTab";
import ImagesTab from "@/components/carousel/ImagesTab";
import LayoutTab from "@/components/carousel/LayoutTab";
import TextStylesTab from "@/components/carousel/TextStylesTab";
import { TextStyleOptions } from "@/types/carousel.types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [activeTab, setActiveTab] = useState("images");

  const [textStyles, setTextStyles] = useState<TextStyleOptions>({
    alignment: "center",
    fontFamily: "helvetica",
    fontSize: 18,
    hasBackground: false,
    backgroundColor: "#000000",
    backgroundOpacity: 50,
    hasOutline: false,
    outlineColor: "#ffffff",
    outlineWidth: 1,
    textPosition: "center",
  });

  useEffect(() => {
    const fetchCarouselData = async () => {
      if (!id || !user) return;
      try {
        setLoading(true);

        const carouselDocRef = doc(db, "carousels", id);
        const carouselDocSnap = await getDoc(carouselDocRef);

        if (!carouselDocSnap.exists()) {
          toast({
            title: "Carrossel não encontrado",
            description: "Este carrossel não existe ou você não tem permissão para acessá-lo.",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }

        const carouselData = carouselDocSnap.data() as CarouselData;

        // Fetch slides
        const slidesCollectionRef = collection(db, "carousels", id, "slides");
        const slidesQuery = query(slidesCollectionRef, orderBy("order_index", "asc"));
        const slidesQuerySnapshot = await getDocs(slidesQuery);

        const slidesData: Slide[] = slidesQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Slide));

        setCarouselData({
          id,
          ...carouselData,
          slides: slidesData
        });
      } catch (error: any) {
        console.error("Erro ao buscar dados do carrossel:", error);
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao buscar os dados do carrossel",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();

  }, [id, user, navigate, toast]);

  const handleSaveCarousel = async () => {
    if (!id || !user || !carouselData) return;
    
    try {
      setSaving(true);
      
      // Salvar carrossel principal
      const carouselRef = doc(firestore, "carousels", id);
      await updateDoc(carouselRef, {
        title: carouselData.title,
        layout_type: carouselData.layout_type,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Carrossel salvo",
        description: "Suas alterações foram salvas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar carrossel:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o carrossel. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlideContent = async (index: number, content: string) => {
    if (!carouselData || !carouselData.slides[index]) return;
    
    try {
      const slide = carouselData.slides[index];
      const slideRef = doc(firestore, "carousels", id!, "slides", slide.id);
      
      await updateDoc(slideRef, {
        content: content,
        updated_at: new Date().toISOString()
      });
      
      // Atualizar estado local
      const updatedSlides = [...carouselData.slides];
      updatedSlides[index] = { ...updatedSlides[index], content };
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
    } catch (error) {
      console.error("Erro ao atualizar slide:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo do slide.",
        variant: "destructive"
      });
    }
  };

  const handleApplyGeneratedTexts = async (texts: { id: number; text: string }[]) => {
    if (!carouselData || !id) return;
    
    try {
      // Primeiro, criar/atualizar slides conforme necessário
      const slidesCollectionRef = collection(firestore, "carousels", id, "slides");
      const slidesQuery = query(slidesCollectionRef, orderBy("order_index", "asc"));
      const existingSlides = await getDocs(slidesQuery);
      
      const updatedSlides: Slide[] = [];
      
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        let slideData: Slide;
        
        if (i < existingSlides.docs.length) {
          // Atualizar slide existente
          const slideDoc = existingSlides.docs[i];
          const slideRef = doc(firestore, "carousels", id, "slides", slideDoc.id);
          
          await updateDoc(slideRef, {
            content: text.text,
            order_index: i,
            updated_at: new Date().toISOString()
          });
          
          slideData = {
            id: slideDoc.id,
            ...slideDoc.data(),
            content: text.text,
            order_index: i
          } as Slide;
        } else {
          // Criar novo slide
          const newSlideRef = await addDoc(slidesCollectionRef, {
            content: text.text,
            order_index: i,
            image_url: null,
            background_type: "color",
            background_value: "#000000",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          slideData = {
            id: newSlideRef.id,
            content: text.text,
            order_index: i,
            image_url: null,
            background_type: "color",
            background_value: "#000000"
          } as Slide;
        }
        
        updatedSlides.push(slideData);
      }
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
      toast({
        title: "Textos aplicados",
        description: `${texts.length} slides foram atualizados com sucesso!`,
      });
      
    } catch (error) {
      console.error("Erro ao aplicar textos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar os textos aos slides.",
        variant: "destructive"
      });
    }
  };

  const handleImagesUploaded = async (imageUrls: string[]) => {
    if (!carouselData || !id) return;
    
    try {
      const slidesCollectionRef = collection(firestore, "carousels", id, "slides");
      const slidesQuery = query(slidesCollectionRef, orderBy("order_index", "asc"));
      const existingSlides = await getDocs(slidesQuery);
      
      // Aplicar imagens aos slides existentes
      for (let i = 0; i < Math.min(imageUrls.length, existingSlides.docs.length); i++) {
        const slideDoc = existingSlides.docs[i];
        const slideRef = doc(firestore, "carousels", id, "slides", slideDoc.id);
        
        await updateDoc(slideRef, {
          image_url: imageUrls[i],
          updated_at: new Date().toISOString()
        });
      }
      
      // Atualizar estado local
      const updatedSlides = carouselData.slides.map((slide, index) => {
        if (index < imageUrls.length) {
          return { ...slide, image_url: imageUrls[index] };
        }
        return slide;
      });
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
      toast({
        title: "Imagens aplicadas",
        description: `${Math.min(imageUrls.length, carouselData.slides.length)} slides foram atualizados com imagens!`,
      });
      
    } catch (error) {
      console.error("Erro ao aplicar imagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar as imagens aos slides.",
        variant: "destructive"
      });
    }
  };

  const handleApplyImageToSlide = async (imageUrl: string, slideIndex: number) => {
    if (!carouselData || !carouselData.slides[slideIndex] || !id) return;
    
    try {
      const slide = carouselData.slides[slideIndex];
      const slideRef = doc(firestore, "carousels", id, "slides", slide.id);
      
      await updateDoc(slideRef, {
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      });
      
      // Atualizar estado local
      const updatedSlides = [...carouselData.slides];
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], image_url: imageUrl };
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
      toast({
        title: "Imagem aplicada",
        description: `Imagem aplicada ao slide ${slideIndex + 1}!`,
      });
      
    } catch (error) {
      console.error("Erro ao aplicar imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar a imagem ao slide.",
        variant: "destructive"
      });
    }
  };

  const handleBackgroundColorChange = async (color: string) => {
    if (!carouselData || !id) return;
    
    try {
      const slidesCollectionRef = collection(firestore, "carousels", id, "slides");
      const slidesQuery = query(slidesCollectionRef);
      const slides = await getDocs(slidesQuery);
      
      // Atualizar cor de fundo de todos os slides
      for (const slideDoc of slides.docs) {
        const slideRef = doc(firestore, "carousels", id, "slides", slideDoc.id);
        await updateDoc(slideRef, {
          background_type: "color",
          background_value: color,
          updated_at: new Date().toISOString()
        });
      }
      
      // Atualizar estado local
      const updatedSlides = carouselData.slides.map(slide => ({
        ...slide,
        background_type: "color",
        background_value: color
      }));
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
      toast({
        title: "Cor de fundo atualizada",
        description: "A cor de fundo foi aplicada a todos os slides!",
      });
      
    } catch (error) {
      console.error("Erro ao alterar cor de fundo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a cor de fundo.",
        variant: "destructive"
      });
    }
  };

  const handleSlideCountChange = async (count: number) => {
    if (!carouselData || !id) return;
    
    try {
      const slidesCollectionRef = collection(firestore, "carousels", id, "slides");
      const slidesQuery = query(slidesCollectionRef, orderBy("order_index", "asc"));
      const existingSlides = await getDocs(slidesQuery);
      
      if (count > existingSlides.docs.length) {
        // Adicionar novos slides
        for (let i = existingSlides.docs.length; i < count; i++) {
          await addDoc(slidesCollectionRef, {
            content: "",
            order_index: i,
            image_url: null,
            background_type: "color",
            background_value: "#000000",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } else if (count < existingSlides.docs.length) {
        // Remover slides extras
        for (let i = count; i < existingSlides.docs.length; i++) {
          const slideRef = doc(firestore, "carousels", id, "slides", existingSlides.docs[i].id);
          await updateDoc(slideRef, { deleted: true });
        }
      }
      
      // Recarregar slides
      const updatedSlidesQuery = query(
        collection(firestore, "carousels", id, "slides"),
        orderBy("order_index", "asc")
      );
      const updatedSlidesSnap = await getDocs(updatedSlidesQuery);
      
      const updatedSlides: Slide[] = updatedSlidesSnap.docs
        .filter(doc => !doc.data().deleted)
        .slice(0, count)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Slide));
      
      setCarouselData({
        ...carouselData,
        slides: updatedSlides
      });
      
      toast({
        title: "Número de slides atualizado",
        description: `O carrossel agora tem ${count} slides!`,
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
    if (!carouselData || !id) return;
    
    try {
      const carouselRef = doc(firestore, "carousels", id);
      await updateDoc(carouselRef, {
        layout_type: layoutType,
        updated_at: new Date().toISOString()
      });
      
      setCarouselData({
        ...carouselData,
        layout_type: layoutType
      });
      
      toast({
        title: "Layout atualizado",
        description: "O layout do carrossel foi alterado com sucesso!",
      });
      
    } catch (error) {
      console.error("Erro ao atualizar layout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o layout.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTextStyles = (styles: TextStyleOptions) => {
    setTextStyles(styles);
    toast({
      title: "Estilos atualizados",
      description: "Os estilos de texto foram aplicados!",
    });
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

  // Helper function to update all slides in Supabase
  const updateSlidesInSupabase = async () => {
    // TODO: Implementar a lógica para atualizar todos os slides no Firestore
  };

  // Helper function to update a single slide in Supabase
  const updateSingleSlideInSupabase = async (index: number, data: Partial<Slide>) => {
    // TODO: Implementar a lógica para atualizar um único slide no Firestore
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
                <h1 className="text-2xl font-bold text-white">
                  {carouselData.title || "Carrossel sem título"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {carouselData.layout_type === "feed_square" ? "Instagram/LinkedIn (Quadrado)" : 
                   carouselData.layout_type === "stories" ? "Instagram/TikTok (Stories)" : 
                   carouselData.layout_type === "pinterest" ? "Pinterest" : "Facebook"}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleSaveCarousel} disabled={saving} className="bg-gradient-to-r from-purple-500 to-blue-500">
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs do Editor */}
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
              {/* Painel de Preview - Oculto na tab de conteúdo */}
              <div className={`col-span-12 ${activeTab === 'content' ? 'hidden' : 'lg:col-span-7'}`}>
                <CarouselPreview 
                  slides={carouselData?.slides || []} 
                  layoutType={carouselData?.layout_type || "instagram_rect"} 
                  textStyles={textStyles} 
                  hidePreview={activeTab === 'content'} 
                />
              </div>

              {/* Painel de Editor - Ocupa toda a largura na tab de conteúdo */}
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
