
import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from "@/components/ui/slider";

interface TextStyles {
  isBold: boolean;
  isItalic: boolean;
  alignment: 'left' | 'center' | 'right';
  fontSize: number;
  textColor: string;
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
}

interface TextEditorProps {
  initialText: string;
  initialStyles?: TextStyles;
  onSave: (text: string, styles: TextStyles) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialText,
  initialStyles,
  onSave,
  onClose,
  position
}) => {
  const [text, setText] = useState(initialText);
  const [styles, setStyles] = useState<TextStyles>({
    isBold: initialStyles?.isBold || false,
    isItalic: initialStyles?.isItalic || false,
    alignment: initialStyles?.alignment || 'center',
    fontSize: initialStyles?.fontSize || 18,
    textColor: initialStyles?.textColor || '#FFFFFF',
    hasBackground: initialStyles?.hasBackground || false,
    backgroundColor: initialStyles?.backgroundColor || '#000000',
    backgroundOpacity: initialStyles?.backgroundOpacity || 50
  });
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Foco automático no textarea quando o editor é aberto
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      
      // Posicionar o cursor no fim do texto
      textAreaRef.current.selectionStart = textAreaRef.current.value.length;
      textAreaRef.current.selectionEnd = textAreaRef.current.value.length;
    }
  }, []);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const toggleStyle = (style: keyof TextStyles) => {
    if (typeof styles[style] === 'boolean') {
      setStyles(prev => ({ ...prev, [style]: !prev[style] }));
    }
  };
  
  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    setStyles(prev => ({ ...prev, alignment }));
  };
  
  const handleSave = () => {
    onSave(text, styles);
  };
  
  useEffect(() => {
    // Add event listener to handle clicks outside the editor
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.text-editor-container')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Detecta Ctrl+Enter para salvar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };
  
  const editorStyle = {
    position: 'fixed' as 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 1000,
    maxWidth: '400px',
    transform: 'translate(-50%, -100%)'
  };
  
  return (
    <div className="text-editor-container" style={editorStyle}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
        <div className="mb-4">
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded text-white resize-none"
            style={{
              fontWeight: styles.isBold ? 'bold' : 'normal',
              fontStyle: styles.isItalic ? 'italic' : 'normal',
              textAlign: styles.alignment,
              fontSize: `${styles.fontSize}px`,
              color: styles.textColor,
              backgroundColor: styles.hasBackground
                ? `rgba(${hexToRgb(styles.backgroundColor)}, ${styles.backgroundOpacity / 100})`
                : 'transparent',
              padding: styles.hasBackground ? '8px' : '2px',
            }}
          />
          <div className="mt-1 text-xs text-gray-400">
            Dica: Pressione Enter para quebrar linha. Três quebras de linha consecutivas dividirão o texto em blocos separados.
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={styles.isBold ? "default" : "outline"}
            size="sm"
            onClick={() => toggleStyle('isBold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant={styles.isItalic ? "default" : "outline"}
            size="sm"
            onClick={() => toggleStyle('isItalic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-8" />
          
          <Button
            variant={styles.alignment === 'left' ? "default" : "outline"}
            size="sm"
            onClick={() => setAlignment('left')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={styles.alignment === 'center' ? "default" : "outline"}
            size="sm"
            onClick={() => setAlignment('center')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant={styles.alignment === 'right' ? "default" : "outline"}
            size="sm"
            onClick={() => setAlignment('right')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-white text-sm">Tamanho da fonte</Label>
              <span className="text-sm text-gray-300">{styles.fontSize}px</span>
            </div>
            <Slider
              value={[styles.fontSize]}
              min={12}
              max={36}
              step={1}
              onValueChange={(value) => setStyles(prev => ({ ...prev, fontSize: value[0] }))}
            />
          </div>
          
          <div>
            <Label className="text-white text-sm mb-2 block">Cor do texto</Label>
            <div className="grid grid-cols-6 gap-2">
              {['#FFFFFF', '#000000', '#FF0000', '#0000FF', '#FFFF00', '#00FF00'].map(color => (
                <Button
                  key={color}
                  className="h-8 w-8 rounded-md p-0 border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: styles.textColor === color ? '#3b82f6' : 'transparent'
                  }}
                  onClick={() => setStyles(prev => ({ ...prev, textColor: color }))}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="bg-toggle" className="text-white">Fundo do texto</Label>
            <Switch
              id="bg-toggle"
              checked={styles.hasBackground}
              onCheckedChange={(checked) => setStyles(prev => ({ ...prev, hasBackground: checked }))}
            />
          </div>
          
          {styles.hasBackground && (
            <>
              <div>
                <Label className="text-white text-sm mb-2 block">Cor do fundo</Label>
                <div className="grid grid-cols-6 gap-2">
                  {['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFFF00', '#00FF00'].map(color => (
                    <Button
                      key={color}
                      className="h-8 w-8 rounded-md p-0 border-2"
                      style={{
                        backgroundColor: color,
                        borderColor: styles.backgroundColor === color ? '#3b82f6' : 'transparent'
                      }}
                      onClick={() => setStyles(prev => ({ ...prev, backgroundColor: color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-white text-sm">Opacidade</Label>
                  <span className="text-sm text-gray-300">{styles.backgroundOpacity}%</span>
                </div>
                <Slider
                  value={[styles.backgroundOpacity]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setStyles(prev => ({ ...prev, backgroundOpacity: value[0] }))}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex to rgb
const hexToRgb = (hex: string): string => {
  // Remove the # if it exists
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

export default TextEditor;
