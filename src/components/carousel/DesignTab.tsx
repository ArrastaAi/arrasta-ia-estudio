import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Sparkles, Wand2, Eye, Settings2 } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";
import AIImageGenerator from "./AIImageGenerator";
import AutoLayoutApplier from "./design/AutoLayoutApplier";
import { LayoutRecommendation } from "./design/SmartLayoutEngine";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { INSTAGRAM_COLORS } from "@/types/carousel.types";
import { Slide } from "@/types/database.types";
import CarouselPreview from "./CarouselPreview";

interface DesignTabProps {
  carouselId: string;
  slides?: Slide[];
  layoutType?: string;
  theme?: string;
  onImagesUploaded: (imageUrls: string[]) => void;
  onSelectImage: (imageUrl: string, slideIndex: number) => void;
  onBackgroundColorChange?: (color: string) => void;
  textStyles?: any;
  onUpdateTextStyles?: (styles: any) => void;
  onSlidesUpdate?: (slides: Slide[]) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({
  carouselId,
  slides = [],
  layoutType = "instagram_rect",
  theme = "Marketing Digital",
  onImagesUploaded,
  onSelectImage,
  onBackgroundColorChange,
  textStyles,
  onUpdateTextStyles,
  onSlidesUpdate
}) => {
  const [activeTab, setActiveTab] = useState<string>("ai-generate");
  const [backgroundColor, setBackgroundColor] = useState<string>("hsl(240, 10%, 3.9%)");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImagesUploaded = async (imageUrls: string[]) => {
    onImagesUploaded(imageUrls);
    setActiveTab("gallery");
    toast({
      title: `${imageUrls.length} ${imageUrls.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}`,
      description: "As imagens foram aplicadas aos slides automaticamente."
    });
  };

  const handleLayoutsApplied = (layouts: { slideId: string; layout: LayoutRecommendation }[]) => {
    if (!onSlidesUpdate) return;
    
    const updatedSlides = slides.map(slide => {
      const layoutData = layouts.find(l => l.slideId === slide.id);
      if (layoutData) {
        const effects = {
          textPosition: layoutData.layout.textPosition,
          overlayIntensity: layoutData.layout.overlayIntensity,
          textColor: layoutData.layout.textColor,
          fontSize: layoutData.layout.fontSize,
          alignment: layoutData.layout.alignment,
          padding: layoutData.layout.padding
        };
        
        return {
          ...slide,
          effects: { ...slide.effects, ...effects }
        };
      }
      return slide;
    });
    
    onSlidesUpdate(updatedSlides);
  };


  return (
    <div className="space-y-6">
      {slides.length > 0 && slides.some(slide => slide.content && slide.content.trim() !== "") && (
        <Card className="bg-background/60 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Preview do Carrossel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarouselPreview 
              slides={slides}
              layoutType={layoutType}
              textStyles={textStyles}
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-background/50 backdrop-blur">
          <TabsTrigger value="ai-generate" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Gerar IA</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Settings2 className="h-4 w-4" />
            <span className="text-xs font-medium">Layout Auto</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Palette className="h-4 w-4" />
            <span className="text-xs font-medium">Estilos</span>
          </TabsTrigger>
        </TabsList>
        
        
        <TabsContent value="ai-generate" className="mt-6">
          <AIImageGenerator 
            slides={slides}
            theme={theme}
            onImagesApplied={onImagesUploaded}
          />
        </TabsContent>

        <TabsContent value="layout" className="mt-6">
          <AutoLayoutApplier 
            slides={slides}
            onLayoutsApplied={handleLayoutsApplied}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-6 space-y-6">
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Imagens
              </CardTitle>
              <CardDescription>
                Faça upload das suas próprias imagens para usar nos slides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload carouselId={carouselId} onImagesUploaded={handleImagesUploaded} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="styles" className="mt-6 space-y-6">
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Estilos de Texto
              </CardTitle>
              <CardDescription>
                Personalize a aparência do texto nos seus slides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Cores do Texto</Label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(INSTAGRAM_COLORS).map(([name, color]) => (
                    <div key={name} className="flex flex-col items-center gap-2">
                      <button
                        className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                          textStyles?.textColor === color 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (onUpdateTextStyles && textStyles) {
                            onUpdateTextStyles({ ...textStyles, textColor: color });
                          }
                        }}
                        title={name}
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignTab;