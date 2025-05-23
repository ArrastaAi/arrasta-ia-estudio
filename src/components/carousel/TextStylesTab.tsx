
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { AlignCenter, AlignLeft, AlignRight, Move, Type, Bold, Italic, Underline } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import EditableText from "./EditableText";
import { TextStyleOptions } from "@/types/carousel.types";

interface TextStylesTabProps {
  textStyles?: TextStyleOptions;
  onUpdateTextStyles?: (styles: TextStyleOptions) => void;
}

const TextStylesTab: React.FC<TextStylesTabProps> = ({ 
  textStyles: externalTextStyles,
  onUpdateTextStyles 
}) => {
  const { toast } = useToast();
  
  // Estado local para gerenciar os estilos de texto quando não há estilos externos
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
    textPosition: "center"
  });
  
  // Texto de exemplo para visualização e edição
  const [sampleText, setSampleText] = useState("Clique para editar este texto de exemplo");
  // Estado para o modo de edição do texto de exemplo
  const [isEditing, setIsEditing] = useState(false);

  // Usa estilos de texto externos se fornecidos
  const effectiveTextStyles = externalTextStyles || textStyles;

  // Atualiza os estilos locais quando os externos mudarem
  useEffect(() => {
    if (externalTextStyles) {
      setTextStyles(externalTextStyles);
    }
  }, [externalTextStyles]);

  // Função para atualizar estilos de texto
  const updateTextStyles = (updates: Partial<TextStyleOptions>) => {
    const newStyles = { ...effectiveTextStyles, ...updates };
    
    if (onUpdateTextStyles) {
      onUpdateTextStyles(newStyles);
    } else {
      setTextStyles(newStyles);
    }
    
    // Notifica usuário sobre a aplicação dos estilos
    toast({
      title: "Estilos atualizados",
      description: "As configurações de texto foram atualizadas."
    });
  };

  const handleTextChange = (newText: string) => {
    setSampleText(newText);
  };

  const handleApplyChanges = () => {
    if (onUpdateTextStyles) {
      onUpdateTextStyles(effectiveTextStyles);
    }
    
    toast({
      title: "Alterações aplicadas",
      description: "Os estilos de texto foram aplicados aos slides."
    });
  };

  // Mapear estilos para o componente EditableText
  const mapToEditableTextStyles = () => {
    return {
      isBold: false,
      isItalic: false,
      alignment: effectiveTextStyles.alignment as 'left' | 'center' | 'right',
      fontSize: effectiveTextStyles.fontSize,
      textColor: "#FFFFFF",
      hasBackground: effectiveTextStyles.hasBackground,
      backgroundColor: effectiveTextStyles.backgroundColor,
      backgroundOpacity: effectiveTextStyles.backgroundOpacity
    };
  };

  return (
    <div className="space-y-5">
      {/* Adiciona visualização de editor de texto */}
      <div className="mb-4 p-4 bg-gray-700 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-white">Preview do Texto</h4>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Concluir Edição" : "Editar Texto"}
          </Button>
        </div>
        
        <div className={`p-4 bg-gray-600 rounded-md text-white 
          ${effectiveTextStyles.hasBackground ? 'bg-opacity-50' : ''} 
          ${effectiveTextStyles.alignment === 'left' ? 'text-left' : 
            effectiveTextStyles.alignment === 'right' ? 'text-right' : 'text-center'}`}
          style={{
            fontFamily: effectiveTextStyles.fontFamily,
            fontSize: `${effectiveTextStyles.fontSize}px`,
            backgroundColor: effectiveTextStyles.hasBackground ? 
              effectiveTextStyles.backgroundColor : undefined,
            textShadow: effectiveTextStyles.hasOutline ? 
              `0 0 ${effectiveTextStyles.outlineWidth}px ${effectiveTextStyles.outlineColor}` : undefined
          }}
        >
          <EditableText 
            text={sampleText}
            onTextChange={handleTextChange}
            styles={mapToEditableTextStyles()}
            isEditing={isEditing}
            onStartEditing={() => setIsEditing(true)}
            onFinishEditing={() => setIsEditing(false)}
            isSelected={isEditing}
          />
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Formatação de texto</Label>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Bold className="h-4 w-4 mr-2" />
            Negrito
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Italic className="h-4 w-4 mr-2" />
            Itálico
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Underline className="h-4 w-4 mr-2" />
            Sublinhado
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Alinhamento do texto</Label>
        <div className="flex space-x-2">
          <Button 
            variant={effectiveTextStyles.alignment === "left" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({alignment: "left"})}
            className="flex-1"
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Esquerda
          </Button>
          <Button 
            variant={effectiveTextStyles.alignment === "center" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({alignment: "center"})}
            className="flex-1"
          >
            <AlignCenter className="h-4 w-4 mr-2" />
            Centro
          </Button>
          <Button 
            variant={effectiveTextStyles.alignment === "right" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({alignment: "right"})}
            className="flex-1"
          >
            <AlignRight className="h-4 w-4 mr-2" />
            Direita
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-3 block">Posição do texto</Label>
        <div className="flex space-x-2">
          <Button 
            variant={effectiveTextStyles.textPosition === "top" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({textPosition: "top"})}
            className="flex-1"
          >
            <Move className="h-4 w-4 mr-2" />
            Topo
          </Button>
          <Button 
            variant={effectiveTextStyles.textPosition === "center" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({textPosition: "center"})}
            className="flex-1"
          >
            <Move className="h-4 w-4 mr-2" />
            Centro
          </Button>
          <Button 
            variant={effectiveTextStyles.textPosition === "bottom" ? "default" : "outline"} 
            size="sm" 
            onClick={() => updateTextStyles({textPosition: "bottom"})}
            className="flex-1"
          >
            <Move className="h-4 w-4 mr-2" />
            Base
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-white mb-3 block">Estilo da fonte</Label>
        <RadioGroup 
          value={effectiveTextStyles.fontFamily} 
          onValueChange={(value) => updateTextStyles({fontFamily: value as 'helvetica' | 'fixture' | 'serif' | 'mono'})}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="flex items-center space-x-2 p-3 cursor-pointer border border-gray-700 hover:border-blue-500 hover:bg-gray-700 data-[state=checked]:border-blue-500">
            <RadioGroupItem value="helvetica" id="font_helvetica" className="sr-only" />
            <Label htmlFor="font_helvetica" className="flex flex-col items-center cursor-pointer w-full">
              <div className="text-lg font-helvetica">Aa</div>
              <span className="text-sm mt-1">Helvetica</span>
            </Label>
          </Card>
          
          <Card className="flex items-center space-x-2 p-3 cursor-pointer border border-gray-700 hover:border-blue-500 hover:bg-gray-700 data-[state=checked]:border-blue-500">
            <RadioGroupItem value="fixture" id="font_fixture" className="sr-only" />
            <Label htmlFor="font_fixture" className="flex flex-col items-center cursor-pointer w-full">
              <div className="text-lg font-fixture">Aa</div>
              <span className="text-sm mt-1">Fixture</span>
            </Label>
          </Card>
          
          <Card className="flex items-center space-x-2 p-3 cursor-pointer border border-gray-700 hover:border-blue-500 hover:bg-gray-700 data-[state=checked]:border-blue-500">
            <RadioGroupItem value="serif" id="font_serif" className="sr-only" />
            <Label htmlFor="font_serif" className="flex flex-col items-center cursor-pointer w-full">
              <div className="text-lg font-serif">Aa</div>
              <span className="text-sm mt-1">Serif</span>
            </Label>
          </Card>
          
          <Card className="flex items-center space-x-2 p-3 cursor-pointer border border-gray-700 hover:border-blue-500 hover:bg-gray-700 data-[state=checked]:border-blue-500">
            <RadioGroupItem value="mono" id="font_mono" className="sr-only" />
            <Label htmlFor="font_mono" className="flex flex-col items-center cursor-pointer w-full">
              <div className="text-lg font-mono">Aa</div>
              <span className="text-sm mt-1">Monospace</span>
            </Label>
          </Card>
        </RadioGroup>
      </div>
      
      {/* Font Size Control */}
      <div>
        <div className="flex justify-between mb-1">
          <Label className="text-white text-sm">Tamanho da fonte</Label>
          <span className="text-sm text-gray-300">{effectiveTextStyles.fontSize}px</span>
        </div>
        <Slider 
          value={[effectiveTextStyles.fontSize]} 
          min={12} 
          max={36} 
          step={1} 
          onValueChange={(value) => updateTextStyles({fontSize: value[0]})}
          className="mt-2"
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-bg-toggle" className="text-white">Fundo do texto</Label>
          <Switch 
            id="text-bg-toggle" 
            checked={effectiveTextStyles.hasBackground}
            onCheckedChange={(checked) => updateTextStyles({hasBackground: checked})}
          />
        </div>
        
        {effectiveTextStyles.hasBackground && (
          <>
            <div>
              <Label className="text-white text-sm mb-2 block">Cor do fundo</Label>
              <div className="grid grid-cols-6 gap-2">
                {["#000000", "#ffffff", "#ff0000", "#0000ff", "#ffff00", "#00ff00"].map(color => (
                  <Button 
                    key={color}
                    className="h-8 w-8 rounded-md p-0 border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: effectiveTextStyles.backgroundColor === color ? '#3b82f6' : 'transparent'
                    }}
                    onClick={() => updateTextStyles({backgroundColor: color})}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-white text-sm">Opacidade</Label>
                <span className="text-sm text-gray-300">{effectiveTextStyles.backgroundOpacity}%</span>
              </div>
              <Slider 
                value={[effectiveTextStyles.backgroundOpacity]} 
                min={0} 
                max={100} 
                step={5} 
                onValueChange={(value) => updateTextStyles({backgroundOpacity: value[0]})}
              />
            </div>
          </>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-outline-toggle" className="text-white">Contorno do texto</Label>
          <Switch 
            id="text-outline-toggle" 
            checked={effectiveTextStyles.hasOutline}
            onCheckedChange={(checked) => updateTextStyles({hasOutline: checked})}
          />
        </div>
        
        {effectiveTextStyles.hasOutline && (
          <>
            <div>
              <Label className="text-white text-sm mb-2 block">Cor do contorno</Label>
              <div className="grid grid-cols-6 gap-2">
                {["#ffffff", "#000000", "#ff0000", "#0000ff", "#ffff00", "#00ff00"].map(color => (
                  <Button 
                    key={color}
                    className="h-8 w-8 rounded-md p-0 border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: effectiveTextStyles.outlineColor === color ? '#3b82f6' : 'transparent'
                    }}
                    onClick={() => updateTextStyles({outlineColor: color})}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-white text-sm">Espessura</Label>
                <span className="text-sm text-gray-300">{effectiveTextStyles.outlineWidth}px</span>
              </div>
              <Slider 
                value={[effectiveTextStyles.outlineWidth]} 
                min={1} 
                max={5} 
                step={1} 
                onValueChange={(value) => updateTextStyles({outlineWidth: value[0]})}
              />
            </div>
          </>
        )}
      </div>

      <Separator className="border-gray-700 my-4" />
      
      <div className="flex justify-end">
        <Button onClick={handleApplyChanges} className="bg-gradient-to-r from-purple-500 to-blue-500">
          Aplicar estilos de texto
        </Button>
      </div>
    </div>
  );
};

export default TextStylesTab;
