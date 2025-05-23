import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { firestore, auth } from "@/integrations/firebase/client";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

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
  const [slideCount, setSlideCount] = useState<number>(5);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  // Load saved settings from Firebase when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !carouselId) return;

      try {
        // Get the carousel data to access settings
        const carouselRef = doc(firestore, "carousels", carouselId);
        const carouselSnap = await getDoc(carouselRef);

        if (!carouselSnap.exists()) {
          console.log("Carrossel não encontrado");
          return;
        }

        const carouselData = carouselSnap.data();

        // Get slides to determine current count
        const slidesCollectionRef = collection(firestore, "slides");
        const slidesQuery = query(slidesCollectionRef, where("carousel_id", "==", carouselId));
        const slidesSnap = await getDocs(slidesQuery);

        const slides: any[] = [];
        slidesSnap.forEach(doc => {
          slides.push(doc.data());
        });

        // Update local state with saved values
        if (slides.length > 0 && slides[0]) {
          setSlideCount(slides.length);

          // Use background color from first slide (assuming all slides have same background)
          if (slides[0].background_value) {
            setBackgroundColor(slides[0].background_value);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [carouselId, user]);

  // When images are uploaded, switch to the gallery tab automatically
  const handleImagesUploaded = (imageUrls: string[]) => {
    onImagesUploaded(imageUrls);
    setActiveTab("gallery");

    // Show success message with count of images uploaded
    toast({
      title: `${imageUrls.length} ${imageUrls.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}`,
      description: "As imagens foram aplicadas aos slides automaticamente."
    });

    saveSettings();
  };

  const handleChangeSlideCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count > 0 && count <= 9) {
      setSlideCount(count);
    }
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBackgroundColor(color);
  };

  const handleApplySettings = () => {
    // Apply both slide count and background color
    if (onSlideCountChange) {
      onSlideCountChange(slideCount);
    }

    if (onBackgroundColorChange) {
      onBackgroundColorChange(backgroundColor);
    }

    saveSettings();

    toast({
      title: `Configurações aplicadas`,
      description: `Número de slides definido para ${slideCount} e cor de fundo atualizada.`
    });
  };

  // Save current settings to Firebase
  const saveSettings = async () => {
    if (!user || !carouselId) return;

    try {
      // Get slides to update
      const slidesCollectionRef = collection(firestore, "slides");
      const slidesQuery = query(slidesCollectionRef, where("carousel_id", "==", carouselId));
      const slidesSnap = await getDocs(slidesQuery);

      slidesSnap.forEach(async (slideDoc) => {
        // Update each slide with the background color
        const slideRef = doc(firestore, "slides", slideDoc.id);
        await updateDoc(slideRef, {
          background_type: "color",
          background_value: backgroundColor,
          updated_at: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4">
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
                    min="1"
                    max="9"
                    value={slideCount}
                    onChange={handleChangeSlideCount}
                    className="w-24 bg-gray-600 text-white"
                  />
                  <span className="text-sm text-gray-300">
                    (máx. 9)
                  </span>
                </div>
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
              
              <Button 
                onClick={handleApplySettings}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
              >
                <Layers className="mr-2 h-4 w-4" />
                Aplicar Configurações
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
