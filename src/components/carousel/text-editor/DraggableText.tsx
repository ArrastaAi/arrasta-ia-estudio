
import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '@/hooks/useDrag';

interface TextStyles {
  fontSize: number;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  fontFamily?: string;
}

interface DraggableTextProps {
  id: string;
  text: string;
  position: { x: number; y: number };
  styles: TextStyles;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onTextChange: (newText: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLElement>;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  id,
  text,
  position,
  styles,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onTextChange,
  onPositionChange,
  containerRef
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localText, setLocalText] = useState(text);
  const [isDragMode, setIsDragMode] = useState(false);

  const { 
    isDragging, 
    handleMouseDown, 
    handleTouchStart,
    style 
  } = useDrag({
    initialPosition: position,
    containerRef,
    onPositionChange,
    boundToContainer: true,
    elementRef
  });

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDownOnElement = (e: React.MouseEvent) => {
    console.log('[DraggableText] Mouse down:', { isEditing, isSelected, isDragMode });
    
    if (isEditing) {
      e.stopPropagation();
      return;
    }

    // Duplo clique para editar
    if (e.detail === 2) {
      e.stopPropagation();
      onEdit();
      return;
    }

    // Clique simples para selecionar
    if (!isSelected) {
      e.stopPropagation();
      onSelect();
      return;
    }

    // Se já está selecionado, permitir arrastar
    setIsDragMode(true);
    handleMouseDown(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && !isDragging) {
      if (!isSelected) {
        console.log('[DraggableText] Selecionando elemento:', id);
        onSelect();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    onTextChange(newText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEdit();
    }
    if (e.key === 'Escape') {
      setLocalText(text);
      onEdit();
    }
  };

  const handleBlur = () => {
    onEdit();
  };

  const getFontFamily = (fontFamily?: string) => {
    console.log('[DraggableText] Aplicando fonte:', fontFamily);
    switch (fontFamily) {
      case 'pacifico': return 'Pacifico, cursive';
      case 'bebas': return '"Bebas Neue", Impact, sans-serif';
      case 'brusher': return '"Dancing Script", cursive';
      case 'selima': return 'Cinzel, serif';
      case 'helvetica': 
      default: return 'Arial, Helvetica, sans-serif';
    }
  };

  const textStyle = {
    fontSize: `${styles.fontSize}px`,
    color: styles.textColor,
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    outline: 'none',
    border: 'none',
    background: 'transparent',
    resize: 'none' as const,
    fontFamily: getFontFamily(styles.fontFamily)
  };

  const containerClasses = `
    absolute transition-all duration-200
    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}
    ${isEditing ? 'cursor-text' : isDragMode || isDragging ? 'cursor-move' : 'cursor-pointer'}
    ${isEditing ? '' : 'select-none'}
  `.trim();

  console.log('[DraggableText] Renderizando:', {
    id,
    fontFamily: styles.fontFamily,
    resolvedFontFamily: getFontFamily(styles.fontFamily),
    isSelected,
    isEditing,
    textColor: styles.textColor
  });

  return (
    <div
      ref={elementRef}
      className={containerClasses}
      style={{
        ...style,
        zIndex: isSelected ? 20 : 10,
        touchAction: isDragging ? 'none' : 'auto'
      }}
      onClick={handleClick}
      onMouseDown={!isEditing ? handleMouseDownOnElement : undefined}
      onTouchStart={!isEditing ? handleTouchStart : undefined}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={textStyle}
          className="min-w-[100px] min-h-[40px] bg-transparent resize-none"
          rows={1}
        />
      ) : (
        <div
          style={textStyle}
          className="min-w-[100px] min-h-[40px] cursor-pointer"
        >
          {localText || 'Clique duas vezes para editar'}
        </div>
      )}
      
      {/* Indicador visual quando selecionado */}
      {isSelected && !isEditing && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
      )}
      
      {/* Dica de interação */}
      {isSelected && !isEditing && (
        <div className="absolute -bottom-6 left-0 text-xs text-blue-400 whitespace-nowrap">
          Duplo clique para editar
        </div>
      )}
    </div>
  );
};

export default DraggableText;
