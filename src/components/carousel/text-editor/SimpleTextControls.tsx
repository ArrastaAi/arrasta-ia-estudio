
import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, Bold, Palette } from 'lucide-react';
import { INSTAGRAM_COLORS } from '@/types/carousel.types';
import FontSelector from './FontSelector';

interface TextStyles {
  fontSize: number;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  fontFamily?: string;
}

interface SimpleTextControlsProps {
  styles: TextStyles;
  onStyleChange: (newStyles: TextStyles) => void;
  onAddText: () => void;
}

const SimpleTextControls: React.FC<SimpleTextControlsProps> = ({
  styles,
  onStyleChange,
  onAddText
}) => {
  const fontSizes = [16, 20, 24, 28, 32];
  const colors = Object.values(INSTAGRAM_COLORS);

  const handleFontChange = (fontKey: string) => {
    console.log('Mudando fonte nos controles para:', fontKey);
    onStyleChange({ ...styles, fontFamily: fontKey });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-3 z-30">
      {/* Adicionar texto */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onAddText}
        className="text-white hover:bg-white/20"
      >
        <Type className="h-4 w-4" />
      </Button>

      {/* Seleção de fonte */}
      <FontSelector
        selectedFont={styles.fontFamily || 'helvetica'}
        onFontChange={handleFontChange}
        showInControls={true}
      />

      {/* Tamanho da fonte */}
      <div className="flex items-center space-x-1">
        {fontSizes.map(size => (
          <Button
            key={size}
            size="sm"
            variant={styles.fontSize === size ? "default" : "ghost"}
            onClick={() => onStyleChange({ ...styles, fontSize: size })}
            className="text-white hover:bg-white/20 px-2"
          >
            {size}
          </Button>
        ))}
      </div>

      {/* Negrito */}
      <Button
        size="sm"
        variant={styles.fontWeight === 'bold' ? "default" : "ghost"}
        onClick={() => onStyleChange({ 
          ...styles, 
          fontWeight: styles.fontWeight === 'bold' ? 'normal' : 'bold' 
        })}
        className="text-white hover:bg-white/20"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Cores do Instagram */}
      <div className="flex items-center space-x-1">
        <Palette className="h-4 w-4 text-white" />
        {colors.slice(0, 6).map(color => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 ${
              styles.textColor === color ? 'border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onStyleChange({ ...styles, textColor: color })}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleTextControls;
