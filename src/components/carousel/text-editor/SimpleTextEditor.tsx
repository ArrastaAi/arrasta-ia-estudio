
import React, { useState, useRef, useEffect } from 'react';
import DraggableText from './DraggableText';
import SimpleTextControls from './SimpleTextControls';
import type { TextStyles, Position, TextElement } from '@/types';

interface SimpleTextEditorProps {
  initialText?: string;
  onTextChange?: (allTexts: string) => void;
  className?: string;
  globalTextStyles?: TextStyles;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  initialText = '',
  onTextChange,
  className = '',
  globalTextStyles
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [globalStyles, setGlobalStyles] = useState<TextStyles>({
    fontSize: 24,
    textColor: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'helvetica',
    backgroundColor: 'transparent',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
  });

  // Atualizar estilos globais quando recebidos do painel lateral
  useEffect(() => {
    if (globalTextStyles) {
      console.log('[SimpleTextEditor] Recebendo estilos globais:', globalTextStyles);
      setGlobalStyles(globalTextStyles);

      // Aplicar aos elementos selecionados
      if (selectedElementId) {
        console.log('[SimpleTextEditor] Aplicando estilos ao elemento selecionado:', selectedElementId);
        updateElementStyles(selectedElementId, globalTextStyles);
      }
    }
  }, [globalTextStyles, selectedElementId]);

  // Inicializar com texto inicial se fornecido
  useEffect(() => {
    if (initialText && textElements.length === 0) {
      const newElement: TextElement = {
        id: crypto.randomUUID(),
        content: initialText,
        position: { x: 10, y: 20 },
        styles: globalStyles
      };
      setTextElements([newElement]);
      setSelectedElementId(newElement.id);
    }
  }, [initialText, textElements.length, globalStyles]);

  // Auto-save: notificar mudanças
  useEffect(() => {
    if (onTextChange) {
      const allTexts = textElements.map(el => el.content).join('\n\n');
      onTextChange(allTexts);
    }
  }, [textElements, onTextChange]);

  const addNewText = () => {
    console.log('[SimpleTextEditor] Adicionando novo texto com estilos:', globalStyles);
    const newElement: TextElement = {
      id: crypto.randomUUID(),
      content: 'Novo texto',
      position: { x: 20, y: 30 + (textElements.length * 60) },
      styles: globalStyles
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setEditingElementId(newElement.id);
  };

  const updateElementText = (id: string, newText: string) => {
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, content: newText } : el
      )
    );
  };

  const updateElementPosition = (id: string, newPosition: Position) => {
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, position: newPosition } : el
      )
    );
  };

  const updateElementStyles = (id: string, newStyles: TextStyles) => {
    console.log('[SimpleTextEditor] Atualizando estilos do elemento:', id, newStyles);
    setTextElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, styles: newStyles } : el
      )
    );
  };

  const handleGlobalStyleChange = (newStyles: TextStyles) => {
    console.log('[SimpleTextEditor] Mudança de estilo global:', newStyles);
    setGlobalStyles(newStyles);
    // Aplicar aos elementos selecionados
    if (selectedElementId) {
      updateElementStyles(selectedElementId, newStyles);
    }
  };

  const handleElementSelect = (id: string) => {
    console.log('[SimpleTextEditor] Selecionando elemento:', id);
    setSelectedElementId(id);
    setEditingElementId(null);
  };

  const handleElementEdit = (id: string) => {
    console.log('[SimpleTextEditor] Alterando estado de edição do elemento:', id);
    if (editingElementId === id) {
      console.log('[SimpleTextEditor] Finalizando edição');
      setEditingElementId(null);
    } else {
      console.log('[SimpleTextEditor] Iniciando edição');
      setEditingElementId(id);
      setSelectedElementId(id); // Garantir que está selecionado
    }
  };

  // Simplificar o handler do container - só desseleciona se clicar no fundo
  const handleContainerClick = (e: React.MouseEvent) => {
    // Só desseleciona se o clique foi diretamente no container (não em um filho)
    if (e.target === e.currentTarget) {
      console.log('[SimpleTextEditor] Clique no container - desselecionando');
      setSelectedElementId(null);
      setEditingElementId(null);
    }
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
      if (editingElementId) return;

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

  console.log('[SimpleTextEditor] Estado atual:', {
    textElementsCount: textElements.length,
    selectedElementId,
    editingElementId,
    globalStyles,
    globalTextStyles
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Container principal */}
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-transparent"
        onClick={handleContainerClick}
      >
        {textElements.map(element => (
          <DraggableText
            key={element.id}
            id={element.id}
            text={element.content}
            position={element.position}
            styles={element.styles}
            isSelected={selectedElementId === element.id}
            isEditing={editingElementId === element.id}
            onSelect={() => handleElementSelect(element.id)}
            onEdit={() => handleElementEdit(element.id)}
            onTextChange={(newText) => updateElementText(element.id, newText)}
            onPositionChange={(newPosition) => updateElementPosition(element.id, newPosition)}
            containerRef={containerRef}
          />
        ))}
        
        {/* Instrução quando não há texto */}
        {textElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <p className="text-lg mb-2">Clique no botão + para adicionar texto</p>
              <p className="text-sm">ou digite algo para começar</p>
            </div>
          </div>
        )}
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
