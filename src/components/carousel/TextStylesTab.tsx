
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignCenter, AlignLeft, AlignRight, Move, Type, Palette, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TextStyleOptions } from "@/types/carousel.types";
import { BRAND_TEMPLATES, PREDIAL_CASA_NOVA_COLORS } from "@/utils/brandTemplates";
import IntelligentTextRenderer from "./text/IntelligentTextRenderer";

interface TextStylesTabProps {
  textStyles?: TextStyleOptions;
  onUpdateTextStyles?: (styles: TextStyleOptions) => void;
}

const TextStylesTab: React.FC<TextStylesTabProps> = ({ 
  textStyles: externalTextStyles,
  onUpdateTextStyles 
}) => {
  const { toast } = useToast();
  
  // Estado local expandido para o novo sistema
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
    // Novas propriedades
    textHierarchy: "primary",
    fontWeight: "bold",
    textColor: PREDIAL_CASA_NOVA_COLORS.white,
    brandStyle: "predial_casa_nova",
    useIntelligentPositioning: true,
    overlayIntensity: 0,
    textCase: "normal",
    letterSpacing: 1
  });
  
  const [sampleText, setSampleText] = useState(`VENDA SEU IMÓVEL CONOSCO
Especialistas em vendas residenciais
Entre em contato agora`);

  const effectiveTextStyles = externalTextStyles || textStyles;

  useEffect(() => {
    if (externalTextStyles) {
      setTextStyles(externalTextStyles);
    }
  }, [externalTextStyles]);

  const updateTextStyles = (updates: Partial<TextStyleOptions>) => {
    const newStyles = { ...effectiveTextStyles, ...updates };
    
    if (onUpdateTextStyles) {
      onUpdateTextStyles(newStyles);
    } else {
      setTextStyles(newStyles);
    }
    
    toast({
      title: "Estilos atualizados",
      description: "As configurações de texto foram atualizadas."
    });
  };

  const applyBrandTemplate = (templateId: string) => {
    const template = BRAND_TEMPLATES[templateId];
    if (!template) return;

    updateTextStyles({
      brandStyle: templateId as any,
      textColor: template.textColor,
      backgroundColor: template.backgroundColor,
      hasBackground: templateId === "corporate_orange" || templateId === "overlay_text",
      backgroundOpacity: templateId === "overlay_text" ? 60 : 100,
      fontWeight: "bold",
      useIntelligentPositioning: true,
      overlayIntensity: templateId === "overlay_text" ? 50 : 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview do Texto com Sistema Inteligente */}
      <div className="mb-6 p-4 bg-gray-700 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Type className="h-4 w-4" />
            Preview Inteligente
          </h4>
        </div>
        
        <div className="relative h-40 bg-gray-600 rounded-md overflow-hidden">
          <IntelligentTextRenderer
            text={sampleText}
            textStyles={effectiveTextStyles}
            imageAnalysis={{ hasDarkAreas: true, hasBrightAreas: true, aspectRatio: "16:9" }}
            onTextChange={setSampleText}
          />
        </div>
      </div>

      {/* Templates da Marca Predial Casa Nova */}
      <div>
        <Label className="text-white mb-3 block flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Templates Predial Casa Nova
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(BRAND_TEMPLATES).map(template => (
            <Card 
              key={template.id}
              className={`p-3 cursor-pointer border-2 transition-all hover:scale-105 ${
                effectiveTextStyles.brandStyle === template.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-700 hover:border-orange-300'
              }`}
              onClick={() => applyBrandTemplate(template.id)}
            >
              <div className="text-center">
                <div 
                  className="w-full h-12 rounded mb-2 flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: template.backgroundColor,
                    color: template.textColor 
                  }}
                >
                  {template.name}
                </div>
                <p className="text-xs text-gray-400">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Posicionamento Inteligente */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="intelligent-positioning" className="text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            Posicionamento Inteligente
          </Label>
          <Switch 
            id="intelligent-positioning" 
            checked={effectiveTextStyles.useIntelligentPositioning}
            onCheckedChange={(checked) => updateTextStyles({useIntelligentPositioning: checked})}
          />
        </div>
        <p className="text-xs text-gray-400">
          Detecta automaticamente a melhor posição do texto baseado na imagem
        </p>
      </div>

      {/* Hierarquia de Texto */}
      <div>
        <Label className="text-white mb-3 block">Hierarquia do Texto</Label>
        <Select 
          value={effectiveTextStyles.textHierarchy} 
          onValueChange={(value: any) => updateTextStyles({textHierarchy: value})}
        >
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="primary">Título Principal</SelectItem>
            <SelectItem value="secondary">Texto Secundário</SelectItem>
            <SelectItem value="cta">Call-to-Action</SelectItem>
            <SelectItem value="brand">Elemento de Marca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Peso da Fonte */}
      <div>
        <Label className="text-white mb-3 block">Peso da Fonte</Label>
        <RadioGroup 
          value={effectiveTextStyles.fontWeight} 
          onValueChange={(value: any) => updateTextStyles({fontWeight: value})}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { value: "light", label: "Light", weight: "300" },
            { value: "regular", label: "Regular", weight: "400" },
            { value: "bold", label: "Bold", weight: "700" },
            { value: "extra-bold", label: "Extra Bold", weight: "800" }
          ].map(option => (
            <Card key={option.value} className="flex items-center space-x-2 p-3 cursor-pointer border border-gray-700 hover:border-orange-500">
              <RadioGroupItem value={option.value} id={`weight_${option.value}`} className="sr-only" />
              <Label htmlFor={`weight_${option.value}`} className="flex flex-col items-center cursor-pointer w-full">
                <div className="text-lg" style={{ fontWeight: option.weight }}>Aa</div>
                <span className="text-sm mt-1">{option.label}</span>
              </Label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Caso do Texto */}
      <div>
        <Label className="text-white mb-3 block">Transformação do Texto</Label>
        <div className="flex space-x-2">
          {[
            { value: "normal", label: "Normal" },
            { value: "uppercase", label: "MAIÚSCULA" },
            { value: "lowercase", label: "minúscula" }
          ].map(option => (
            <Button 
              key={option.value}
              variant={effectiveTextStyles.textCase === option.value ? "default" : "outline"} 
              size="sm" 
              onClick={() => updateTextStyles({textCase: option.value as any})}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Espaçamento entre Letras */}
      <div>
        <div className="flex justify-between mb-1">
          <Label className="text-white text-sm">Espaçamento entre Letras</Label>
          <span className="text-sm text-gray-300">{effectiveTextStyles.letterSpacing}em</span>
        </div>
        <Slider 
          value={[effectiveTextStyles.letterSpacing]} 
          min={-0.1} 
          max={0.3} 
          step={0.05} 
          onValueChange={(value) => updateTextStyles({letterSpacing: value[0]})}
          className="mt-2"
        />
      </div>

      {/* Overlay Inteligente */}
      <div>
        <div className="flex justify-between mb-1">
          <Label className="text-white text-sm">Intensidade do Overlay</Label>
          <span className="text-sm text-gray-300">{effectiveTextStyles.overlayIntensity}%</span>
        </div>
        <Slider 
          value={[effectiveTextStyles.overlayIntensity]} 
          min={0} 
          max={100} 
          step={5} 
          onValueChange={(value) => updateTextStyles({overlayIntensity: value[0]})}
          className="mt-2"
        />
      </div>

      {/* Cores da Marca */}
      <div>
        <Label className="text-white text-sm mb-2 block">Cores da Predial Casa Nova</Label>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(PREDIAL_CASA_NOVA_COLORS).map(([name, color]) => (
            <Button 
              key={name}
              className="h-8 w-8 rounded-md p-0 border-2"
              style={{ 
                backgroundColor: color,
                borderColor: effectiveTextStyles.textColor === color ? '#3b82f6' : 'transparent'
              }}
              onClick={() => updateTextStyles({textColor: color})}
              title={name}
            />
          ))}
        </div>
      </div>

      <Separator className="border-gray-700 my-4" />
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            if (onUpdateTextStyles) {
              onUpdateTextStyles(effectiveTextStyles);
            }
            toast({
              title: "Estilos aplicados",
              description: "Os estilos da Predial Casa Nova foram aplicados aos slides."
            });
          }} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          Aplicar Estilo Predial Casa Nova
        </Button>
      </div>
    </div>
  );
};

export default TextStylesTab;
