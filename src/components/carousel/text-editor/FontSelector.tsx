
import React from 'react';
import { Button } from '@/components/ui/button';

interface FontOption {
  key: string;
  name: string;
  displayName: string;
  previewText: string;
  fallback: string;
}

interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (fontKey: string) => void;
  showInControls?: boolean;
}

const FONT_OPTIONS: FontOption[] = [
  {
    key: 'helvetica',
    name: 'font-sans',
    displayName: 'Helvetica',
    previewText: 'Aa',
    fallback: 'Arial, sans-serif'
  },
  {
    key: 'pacifico',
    name: 'font-pacifico',
    displayName: 'Pacifico',
    previewText: 'Aa',
    fallback: 'cursive'
  },
  {
    key: 'bebas',
    name: 'font-bebas',
    displayName: 'Bebas',
    previewText: 'Aa',
    fallback: 'Impact, sans-serif'
  },
  {
    key: 'brusher',
    name: 'font-dancing',
    displayName: 'Brusher',
    previewText: 'Aa',
    fallback: 'Dancing Script, cursive'
  },
  {
    key: 'selima',
    name: 'font-cinzel',
    displayName: 'Selima',
    previewText: 'Aa',
    fallback: 'Cinzel, serif'
  }
];

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
  showInControls = false
}) => {
  const handleFontChange = (fontKey: string) => {
    console.log('[FontSelector] Fonte selecionada:', fontKey);
    onFontChange(fontKey);
  };

  if (showInControls) {
    // Versão compacta para os controles flutuantes
    return (
      <div className="flex items-center space-x-1">
        {FONT_OPTIONS.slice(0, 3).map(font => (
          <Button
            key={font.key}
            size="sm"
            variant={selectedFont === font.key ? "default" : "ghost"}
            onClick={() => handleFontChange(font.key)}
            className={`text-white hover:bg-white/20 px-2`}
            style={{ fontFamily: font.fallback }}
          >
            {font.previewText}
          </Button>
        ))}
      </div>
    );
  }

  // Versão completa para o painel lateral com fundo escuro
  return (
    <div className="grid grid-cols-2 gap-3">
      {FONT_OPTIONS.map(font => (
        <Button
          key={font.key}
          variant={selectedFont === font.key ? "default" : "outline"}
          onClick={() => handleFontChange(font.key)}
          className={`h-16 flex flex-col items-center justify-center transition-all ${
            selectedFont === font.key 
              ? 'border-purple-500 bg-purple-600 text-white shadow-lg' 
              : 'border-gray-600 hover:border-purple-400 text-white bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <span 
            className="text-xl text-white mb-1" 
            style={{ fontFamily: font.fallback }}
          >
            {font.previewText}
          </span>
          <span className="text-xs text-gray-300">{font.displayName}</span>
        </Button>
      ))}
    </div>
  );
};

export default FontSelector;
