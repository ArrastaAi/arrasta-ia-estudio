
import React from 'react';
import { Button } from '@/components/ui/button';

interface FontOption {
  key: string;
  name: string;
  displayName: string;
  previewText: string;
}

interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (fontKey: string) => void;
  showInControls?: boolean;
}

const FONT_OPTIONS: FontOption[] = [
  {
    key: 'helvetica',
    name: 'font-helvetica',
    displayName: 'Helvetica',
    previewText: 'Aa'
  },
  {
    key: 'pacifico',
    name: 'font-pacifico',
    displayName: 'Pacifico',
    previewText: 'Aa'
  },
  {
    key: 'bebas',
    name: 'font-bebas',
    displayName: 'Bebas',
    previewText: 'Aa'
  },
  {
    key: 'brusher',
    name: 'font-brusher',
    displayName: 'Brusher',
    previewText: 'Aa'
  },
  {
    key: 'selima',
    name: 'font-selima',
    displayName: 'Selima',
    previewText: 'Aa'
  }
];

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
  showInControls = false
}) => {
  if (showInControls) {
    // Versão compacta para os controles flutuantes
    return (
      <div className="flex items-center space-x-1">
        {FONT_OPTIONS.slice(0, 3).map(font => (
          <Button
            key={font.key}
            size="sm"
            variant={selectedFont === font.key ? "default" : "ghost"}
            onClick={() => onFontChange(font.key)}
            className={`text-white hover:bg-white/20 px-2 ${font.name}`}
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
          onClick={() => onFontChange(font.key)}
          className={`h-12 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 border-2 ${
            selectedFont === font.key 
              ? 'border-purple-500 bg-purple-600 text-white' 
              : 'border-gray-600 hover:border-purple-400 text-white'
          }`}
        >
          <span className={`text-lg text-white ${font.name}`}>{font.previewText}</span>
          <span className="text-xs text-gray-300">{font.displayName}</span>
        </Button>
      ))}
    </div>
  );
};

export default FontSelector;
