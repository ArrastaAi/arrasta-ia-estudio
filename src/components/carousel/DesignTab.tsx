
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Palette, Info } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { INSTAGRAM_COLORS } from "@/types/carousel.types";

interface DesignTabProps {
  carouselId: string;
  onImagesUploaded: (imageUrls: string[]) => void;
  onSelectImage: (imageUrl: string, slideIndex: number) => void;
  onBackgroundColorChange?: (color: string) => void;
  textStyles?: any;
  onUpdateTextStyles?: (styles: any) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({
  carouselId,
  onImagesUploaded,
  onSelectImage,
  onBackgroundColorChange,
  textStyles,
  onUpdateTextStyles
}) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
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

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBackgroundColor(color);
    if (onBackgroundColorChange) {
      onBackgroundColorChange(color);
    }
  };

  const handleColorChange = (color: string) => {
    if (onUpdateTextStyles && textStyles) {
      const newStyles = { 
        ...textStyles, 
        textColor: color 
      };
      onUpdateTextStyles(newStyles);
      toast({
        title: "Cor alterada",
        description: "Nova cor aplicada com sucesso."
      });
    }
  };

  const fontSizes = [16, 20, 24, 28, 32];

  const handleFontSizeChange = (size: number) => {
    if (onUpdateTextStyles && textStyles) {
      const newStyles = { 
        ...textStyles, 
        fontSize: size 
      };
      onUpdateTextStyles(newStyles);
    }
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-blue-300">
          <strong>Design simples:</strong> Faça upload de imagens e ajuste cores e tamanhos básicos.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Imagens
          </TabsTrigger>
          <TabsTrigger value="styles">
            <Palette className="h-4 w-4 mr-2" />
            Estilos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-0 space-y-4">
          <ImageUpload carouselId={carouselId} onImagesUploaded={handleImagesUploaded} />
          
          <div className="p-4 bg-gray-700 rounded-md">
            <Label htmlFor="backgroundColor" className="text-sm text-gray-300 mb-2 block">
              Cor de Fundo dos Slides
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={handleBackgroundColorChange}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={handleBackgroundColorChange}
                className="w-24 bg-gray-600 text-white"
              />
            </div>
          </div>
          
          <ImageGallery carouselId={carouselId} onSelectImage={onSelectImage} />
        </TabsContent>
        
        <TabsContent value="styles" className="mt-0 space-y-6">
          {/* Tamanhos de Fonte */}
          <div>
            <Label className="text-white mb-3 block">Tamanho da Fonte</Label>
            <div className="flex gap-2">
              {fontSizes.map(size => (
                <Button
                  key={size}
                  size="sm"
                  variant={textStyles?.fontSize === size ? "default" : "outline"}
                  onClick={() => handleFontSizeChange(size)}
                  className="px-3"
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>

          {/* Cores do Instagram */}
          <div>
            <Label className="text-white mb-3 block">Cores do Texto</Label>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(INSTAGRAM_COLORS).map(([name, color]) => (
                <div key={name} className="flex flex-col items-center">
                  <button
                    className={`w-12 h-12 rounded-lg border-2 hover:scale-110 transition-transform ${
                      textStyles?.textColor === color 
                        ? 'border-white ring-2 ring-purple-500' 
                        : 'border-gray-600 hover:border-white'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={name}
                  />
                  <span className="text-xs text-gray-400 mt-1 capitalize">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignTab;
