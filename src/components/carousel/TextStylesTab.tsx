
import React from 'react';
import { Label } from "@/components/ui/label";
import { Type, Palette } from "lucide-react";
import { TextStyleOptions, INSTAGRAM_COLORS } from "@/types/carousel.types";
import FontSelector from "./text-editor/FontSelector";
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

  const handleFontChange = (fontKey: string) => {
    console.log('[TextStylesTab] Alterando fonte para:', fontKey);
    if (onUpdateTextStyles && textStyles) {
      const newStyles = { 
        ...textStyles, 
        fontFamily: fontKey as any
      };
      console.log('[TextStylesTab] Novos estilos sendo enviados:', newStyles);
      onUpdateTextStyles(newStyles);
      toast({
        title: "Fonte alterada",
        description: `Fonte ${fontKey} aplicada com sucesso.`
      });
    } else {
      console.log('[TextStylesTab] Erro: onUpdateTextStyles ou textStyles não disponível', {
        hasCallback: !!onUpdateTextStyles,
        hasTextStyles: !!textStyles
      });
    }
  };

  const handleColorChange = (color: string) => {
    console.log('[TextStylesTab] Alterando cor para:', color);
    if (onUpdateTextStyles && textStyles) {
      const newStyles = { 
        ...textStyles, 
        textColor: color 
      };
      console.log('[TextStylesTab] Novos estilos de cor:', newStyles);
      onUpdateTextStyles(newStyles);
      toast({
        title: "Cor alterada",
        description: "Nova cor aplicada com sucesso."
      });
    }
  };

  console.log('[TextStylesTab] Renderizando com:', {
    selectedFont: textStyles?.fontFamily || 'helvetica',
    selectedColor: textStyles?.textColor || '#FFFFFF',
    hasCallback: !!onUpdateTextStyles
  });

  return (
    <div className="space-y-6">
      {/* Seleção de Fontes */}
      <div>
        <Label className="text-white mb-3 block flex items-center gap-2">
          <Type className="h-4 w-4" />
          Fontes de Texto
        </Label>
        <FontSelector
          selectedFont={textStyles?.fontFamily || 'helvetica'}
          onFontChange={handleFontChange}
        />
      </div>

      {/* Cores do Instagram */}
      <div>
        <Label className="text-white mb-3 block flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Cores do Instagram
        </Label>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(INSTAGRAM_COLORS).map(([name, color]) => (
            <div key={name} className="flex flex-col items-center">
              <button
                className={`w-12 h-12 rounded-lg border-3 hover:scale-110 transition-transform ${
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
    </div>
  );
};

export default TextStylesTab;
