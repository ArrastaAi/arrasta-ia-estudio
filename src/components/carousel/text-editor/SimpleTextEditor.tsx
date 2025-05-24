
import React, { useState, useRef, useEffect } from 'react';
import DraggableText from './DraggableText';
import SimpleTextControls from './SimpleTextControls';

interface TextStyles {
  fontSize: number;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number };
  styles: TextStyles;
}

interface SimpleTextEditorProps {
  initialText?: string;
  onTextChange?: (allTexts: string) => void;
  className?: string;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  initialText = '',
  onTextChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [globalStyles, setGlobalStyles] = useState<TextStyles>({
    fontSize: 24,
    textColor: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center'
  });

  // Inicializar com texto inicial se fornecido
  useEffect(() => {
    if (initialText && textElements.length === 0) {
      const newElement: TextElement = {
        id: crypto.randomUUID(),
        text: initialText,
        position: { x: 10, y: 20 },
        styles: globalStyles
      };
      setTextElements([newElement]);
    }
  }, [initialText, textElements.length, globalStyles]);

  // Auto-save: notificar mudanças
  useEffect(() => {
    if (onTextChange) {
      const allTexts = textElements.map(el => el.text).join('\n\n');
      onTextChange(allTexts);
    }
  }, [textElements, onTextChange]);

  const addNewText = () => {
    const newElement: TextElement = {
      id: crypto.randomUUID(),
      text: 'Novo texto',
      position: { x: 20, y: 30 },
      styles: globalStyles
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setEditingElementId(newElement.id);
  };

  const updateElementText = (id: string, newText: string) => {
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, text: newText } : el
      )
    );
  };

  const updateElementPosition = (id: string, newPosition: { x: number; y: number }) => {
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, position: newPosition } : el
      )
    );
  };

  const updateElementStyles = (id: string, newStyles: TextStyles) => {
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, styles: newStyles } : el
      )
    );
  };

  const handleGlobalStyleChange = (newStyles: TextStyles) => {
    setGlobalStyles(newStyles);
    // Aplicar aos elementos selecionados
    if (selectedElementId) {
      updateElementStyles(selectedElementId, newStyles);
    }
  };

  const handleContainerClick = () => {
    setSelectedElementId(null);
    setEditingElementId(null);
  };

  const deleteElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    if (editingElementId === id) {
      setEditingElementId(null);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingElementId) return; // Não interferir durante edição

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        setEditingElementId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editingElementId]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Container principal */}
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        onClick={handleContainerClick}
      >
        {textElements.map(element => (
          <DraggableText
            key={element.id}
            id={element.id}
            text={element.text}
            position={element.position}
            styles={element.styles}
            isSelected={selectedElementId === element.id}
            isEditing={editingElementId === element.id}
            onSelect={() => setSelectedElementId(element.id)}
            onEdit={() => {
              if (editingElementId === element.id) {
                setEditingElementId(null);
              } else {
                setEditingElementId(element.id);
              }
            }}
            onTextChange={(newText) => updateElementText(element.id, newText)}
            onPositionChange={(newPosition) => updateElementPosition(element.id, newPosition)}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Controles simples */}
      <SimpleTextControls
        styles={selectedElementId ? 
          textElements.find(el => el.id === selectedElementId)?.styles || globalStyles : 
          globalStyles
        }
        onStyleChange={handleGlobalStyleChange}
        onAddText={addNewText}
      />
    </div>
  );
};

export default SimpleTextEditor;
