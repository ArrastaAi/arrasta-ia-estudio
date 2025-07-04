
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Sparkles, Wand2, Eye, Settings2 } from "lucide-react";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";
import AIImageGenerator from "./AIImageGenerator";
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
  onUpdateTextStyles
}) => {
  const [activeTab, setActiveTab] = useState<string>("magic-design");
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
  const handleMagicDesign = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para usar o Design Automático",
        variant: "destructive"
      });
      return;
    }

    if (slides.length === 0 || !slides.some(slide => slide.content?.trim())) {
      toast({
        title: "Conteúdo necessário",
        description: "Primeiro crie conteúdo na aba Conteúdo",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🎨 Iniciando Design Automático",
      description: "Gerando imagens inteligentes e aplicando layout profissional..."
    });

    // Automaticamente mudar para a aba de geração de IA
    setActiveTab("ai-generate");
  };

  return (
    <div className="space-y-6">
      {/* Preview do Carrossel */}
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
          <TabsTrigger value="magic-design" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Wand2 className="h-4 w-4" />
            <span className="text-xs font-medium">Magic Design</span>
          </TabsTrigger>
          <TabsTrigger value="ai-generate" className="flex flex-col gap-1 h-16 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Gerar IA</span>
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
        
        <TabsContent value="magic-design" className="mt-6 space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Design Automático com IA</CardTitle>
              <CardDescription className="text-base">
                Deixe nossa IA criar um design profissional completo para seu carrossel. 
                Do conteúdo ao layout final em apenas um clique.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium">Imagens IA</h4>
                  <p className="text-sm text-muted-foreground">Gera imagens contextuais para cada slide</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <Settings2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-medium">Layout Inteligente</h4>
                  <p className="text-sm text-muted-foreground">Posiciona texto e elementos automaticamente</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-medium">Resultado Final</h4>
                  <p className="text-sm text-muted-foreground">Design profissional pronto para publicação</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleMagicDesign}
                  size="lg"
                  className="w-full max-w-md h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base font-medium"
                  disabled={slides.length === 0 || !slides.some(slide => slide.content?.trim())}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  Criar Design Automático
                </Button>
                
                {(!slides.length || !slides.some(slide => slide.content?.trim())) && (
                  <p className="text-sm text-muted-foreground text-center">
                    Primeiro crie conteúdo na aba "Conteúdo" para ativar o Design Automático
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai-generate" className="mt-6">
          <AIImageGenerator 
            slides={slides}
            theme={theme}
            onImagesApplied={onImagesUploaded}
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
          
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Cor de Fundo</CardTitle>
              <CardDescription>
                Personalize a cor de fundo dos seus slides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={handleBackgroundColorChange}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={handleBackgroundColorChange}
                    className="w-32"
                    placeholder="HSL color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Galeria de Imagens</CardTitle>
              <CardDescription>
                Selecione imagens já enviadas para aplicar nos slides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGallery carouselId={carouselId} onSelectImage={onSelectImage} />
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
              {/* Tamanhos de Fonte */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tamanho da Fonte</Label>
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

              <Separator />

              {/* Cores do Texto */}
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
                        onClick={() => handleColorChange(color)}
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
