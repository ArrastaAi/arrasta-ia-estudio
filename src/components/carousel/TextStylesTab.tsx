
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Type, Palette } from "lucide-react";
import { TextStyleOptions, ARRASTAAI_COLORS } from "@/types/carousel.types";
import { ARRASTAAI_TEMPLATES } from "@/utils/arrastaaiTemplates";
import { useToast } from "@/hooks/use-toast";

interface TextStylesTabProps {
  textStyles?: TextStyleOptions;
  onUpdateTextStyles?: (styles: TextStyleOptions) => void;
}

const TextStylesTab: React.FC<TextStylesTabProps> = ({ 
  textStyles: externalTextStyles,
  onUpdateTextStyles 
}) => {
  const { toast } = useToast();
  
  const [textStyles, setTextStyles] = useState<TextStyleOptions>({
    textSize: "medium",
    textPosition: "center",
    textStyle: "minimal",
    textColor: ARRASTAAI_COLORS.white,
    hasBackground: false,
    backgroundColor: ARRASTAAI_COLORS.black,
    backgroundOpacity: 60,
    alignment: "center",
    fontFamily: "helvetica",
    fontSize: 24,
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
  
  const [sampleText, setSampleText] = useState("TEXTO DE EXEMPLO\nPara demonstrar o estilo");

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
      title: "Estilo atualizado",
      description: "As configurações de texto foram aplicadas."
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = ARRASTAAI_TEMPLATES[templateId];
    if (!template) return;

    updateTextStyles({
      ...template.textStyle,
      brandStyle: `arrastaai_${templateId}` as any
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview Simplificado */}
      <div className="mb-6 p-4 bg-gray-800 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Type className="h-4 w-4" />
            Preview do Texto
          </h4>
        </div>
        
        <div 
          className="relative h-32 rounded-md overflow-hidden flex items-center justify-center"
          style={{ 
            backgroundColor: effectiveTextStyles.hasBackground ? 
              effectiveTextStyles.backgroundColor : "#4A5568"
          }}
        >
          <div className="text-center">
            <div 
              className="font-bold"
              style={{
                fontSize: effectiveTextStyles.textSize === "large" ? "28px" : 
                         effectiveTextStyles.textSize === "medium" ? "20px" : "16px",
                color: effectiveTextStyles.textColor,
                textTransform: effectiveTextStyles.textCase === "uppercase" ? "uppercase" : 
                              effectiveTextStyles.textCase === "lowercase" ? "lowercase" : "none"
              }}
            >
              {sampleText}
            </div>
          </div>
        </div>
      </div>

      {/* Templates ArrastaAí */}
      <div>
        <Label className="text-white mb-3 block flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Templates ArrastaAí
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(ARRASTAAI_TEMPLATES).map(template => (
            <Card 
              key={template.id}
              className={`p-3 cursor-pointer border-2 transition-all hover:scale-105 ${
                effectiveTextStyles.textStyle === template.id
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-700 hover:border-purple-300'
              }`}
              onClick={() => applyTemplate(template.id)}
            >
              <div className="text-center">
                <div 
                  className="w-full h-12 rounded mb-2 flex items-center justify-center text-2xl"
                  style={{ 
                    backgroundColor: template.colors.background,
                    color: template.colors.text 
                  }}
                >
                  {template.preview}
                </div>
                <p className="text-xs font-medium text-white">{template.name}</p>
                <p className="text-xs text-gray-400">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Controles Essenciais */}
      <div className="space-y-4">
        {/* Tamanho */}
        <div>
          <Label className="text-white mb-2 block">Tamanho do Texto</Label>
          <div className="flex space-x-2">
            {[
              { value: "small", label: "Pequeno" },
              { value: "medium", label: "Médio" },
              { value: "large", label: "Grande" }
            ].map(option => (
              <Button 
                key={option.value}
                variant={effectiveTextStyles.textSize === option.value ? "default" : "outline"} 
                size="sm" 
                onClick={() => updateTextStyles({ textSize: option.value as any })}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Posição */}
        <div>
          <Label className="text-white mb-2 block">Posição</Label>
          <div className="flex space-x-2">
            {[
              { value: "top", label: "Topo" },
              { value: "center", label: "Centro" },
              { value: "bottom", label: "Base" }
            ].map(option => (
              <Button 
                key={option.value}
                variant={effectiveTextStyles.textPosition === option.value ? "default" : "outline"} 
                size="sm" 
                onClick={() => updateTextStyles({ textPosition: option.value as any })}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cores ArrastaAí */}
        <div>
          <Label className="text-white text-sm mb-2 block">Cores ArrastaAí</Label>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(ARRASTAAI_COLORS).map(([name, color]) => (
              <Button 
                key={name}
                className="h-8 w-8 rounded-md p-0 border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: effectiveTextStyles.textColor === color ? '#A259FF' : 'transparent'
                }}
                onClick={() => updateTextStyles({ textColor: color })}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Fundo */}
        <div className="flex items-center justify-between">
          <Label htmlFor="text-background" className="text-white">
            Fundo do Texto
          </Label>
          <Button
            variant={effectiveTextStyles.hasBackground ? "default" : "outline"}
            size="sm"
            onClick={() => updateTextStyles({ hasBackground: !effectiveTextStyles.hasBackground })}
          >
            {effectiveTextStyles.hasBackground ? "Com Fundo" : "Sem Fundo"}
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => {
            if (onUpdateTextStyles) {
              onUpdateTextStyles(effectiveTextStyles);
            }
            toast({
              title: "Estilo aplicado",
              description: "O estilo ArrastaAí foi aplicado aos slides."
            });
          }} 
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          Aplicar Estilo ArrastaAí
        </Button>
      </div>
    </div>
  );
};

export default TextStylesTab;
