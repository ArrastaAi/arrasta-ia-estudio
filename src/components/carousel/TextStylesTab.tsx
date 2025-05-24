
import React from 'react';
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
    if (onUpdateTextStyles && textStyles) {
      onUpdateTextStyles({ 
        ...textStyles, 
        fontFamily: fontKey as any
      });
      toast({
        title: "Fonte alterada",
        description: `Fonte ${fontKey} aplicada com sucesso.`
      });
    }
  };

  const handleColorChange = (color: string) => {
    if (onUpdateTextStyles && textStyles) {
      onUpdateTextStyles({ 
        ...textStyles, 
        textColor: color 
      });
      toast({
        title: "Cor alterada",
        description: "Nova cor aplicada com sucesso."
      });
    }
  };

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

      {/* Dicas de Uso */}
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="text-center space-y-2">
          <h3 className="text-white font-medium flex items-center justify-center gap-2">
            <Type className="h-4 w-4" />
            Dicas de Edição
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Clique no texto para editar</p>
            <p>• Arraste para mover o texto</p>
            <p>• Use Enter para nova linha</p>
            <p>• ESC para cancelar edição</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TextStylesTab;
