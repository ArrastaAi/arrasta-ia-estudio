
import React, { useState } from 'react';
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
  textStyles,
  onUpdateTextStyles 
}) => {
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");

  const applyTemplate = (templateId: string) => {
    const template = ARRASTAAI_TEMPLATES[templateId];
    if (!template || !onUpdateTextStyles) return;

    setSelectedTemplate(templateId);
    
    onUpdateTextStyles({
      textSize: template.textStyle.textSize || "medium",
      textPosition: template.textStyle.textPosition || "center",
      textStyle: template.textStyle.textStyle || "minimal",
      textColor: template.textStyle.textColor || ARRASTAAI_COLORS.white,
      fontFamily: template.textStyle.fontFamily || "helvetica",
      hasBackground: template.textStyle.hasBackground || false,
      backgroundColor: template.textStyle.backgroundColor || ARRASTAAI_COLORS.black,
      backgroundOpacity: template.textStyle.backgroundOpacity || 60,
      alignment: "center",
      fontSize: 24,
      hasOutline: false,
      outlineColor: "#ffffff",
      outlineWidth: 1,
      textHierarchy: "primary",
      fontWeight: template.textStyle.fontWeight || "regular",
      brandStyle: `arrastaai_${templateId}` as any,
      useIntelligentPositioning: true,
      overlayIntensity: 0,
      textCase: template.textStyle.textCase || "none",
      letterSpacing: 0.02
    });
    
    toast({
      title: "Template aplicado",
      description: `Template ${template.name} foi aplicado com sucesso.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Templates ArrastaAí */}
      <div>
        <Label className="text-white mb-3 block flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Templates de Texto
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(ARRASTAAI_TEMPLATES).map(template => (
            <Card 
              key={template.id}
              className={`p-3 cursor-pointer border-2 transition-all hover:scale-105 ${
                selectedTemplate === template.id
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

      {/* Cores Rápidas */}
      <div>
        <Label className="text-white text-sm mb-2 block">Cores Rápidas</Label>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(ARRASTAAI_COLORS).map(([name, color]) => (
            <Button 
              key={name}
              className="h-8 w-8 rounded-md p-0 border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (onUpdateTextStyles && textStyles) {
                  onUpdateTextStyles({ ...textStyles, textColor: color });
                }
              }}
              title={name}
            />
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-400">
          💡 Clique no texto para editar. Arraste para mover.
        </p>
      </div>
    </div>
  );
};

export default TextStylesTab;
