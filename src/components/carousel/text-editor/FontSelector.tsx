
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
    fallback: 'Pacifico, cursive'
  },
  {
    key: 'bebas',
    name: 'font-bebas',
    displayName: 'Bebas',
    previewText: 'Aa',
    fallback: '"Bebas Neue", Impact, sans-serif'
  },
  {
    key: 'brusher',
    name: 'font-dancing',
    displayName: 'Brusher',
    previewText: 'Aa',
    fallback: '"Dancing Script", cursive'
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

  // Versão para o painel lateral - mesmo tamanho das cores (w-12 h-12)
  return (
    <div className="grid grid-cols-5 gap-3">
      {FONT_OPTIONS.map(font => (
        <div key={font.key} className="flex flex-col items-center">
          <button
            onClick={() => handleFontChange(font.key)}
            className={`w-12 h-12 rounded-lg border-2 hover:scale-110 transition-all flex items-center justify-center ${
              selectedFont === font.key 
                ? 'border-white ring-2 ring-purple-500 bg-purple-600' 
                : 'border-gray-600 hover:border-white bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <span 
              className="text-lg text-white font-medium" 
              style={{ fontFamily: font.fallback }}
            >
              {font.previewText}
            </span>
          </button>
          <span className="text-xs text-gray-400 mt-1 text-center">
            {font.displayName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FontSelector;
