
import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '@/hooks/useDrag';
import type { TextStyles, Position } from '@/types';

interface DraggableTextProps {
  id: string;
  text: string;
  position: Position;
  styles: TextStyles;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onTextChange: (newText: string) => void;
  onPositionChange: (position: Position) => void;
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
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && !isSelected) {
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onEdit();
    }
  };

  const handleMouseDownForDrag = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      return;
    }

    if (isSelected && !isDragging) {
      handleMouseDown(e);
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

  const getFontFamily = (fontFamily: string) => {
    const fontMap = {
      'pacifico': 'Pacifico, cursive',
      'bebas': '"Bebas Neue", Impact, sans-serif',
      'brusher': '"Dancing Script", cursive',
      'selima': 'Cinzel, serif',
      'roboto': 'Roboto, sans-serif',
      'playfair': '"Playfair Display", serif',
      'montserrat': 'Montserrat, sans-serif',
      'lato': 'Lato, sans-serif'
    };
    return fontMap[fontFamily as keyof typeof fontMap] || 'Arial, Helvetica, sans-serif';
  };

  const textStyle = {
    fontSize: `${styles.fontSize}px`,
    color: styles.textColor,
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    fontFamily: getFontFamily(styles.fontFamily),
    backgroundColor: styles.backgroundColor || 'transparent',
    textShadow: styles.textShadow || '0 1px 3px rgba(0,0,0,0.5)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    outline: 'none',
    border: 'none',
    resize: 'none' as const,
    padding: '8px'
  };

  const containerClasses = `
    absolute transition-all duration-200 cursor-pointer rounded-lg
    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}
    ${isEditing ? 'cursor-text bg-white/10 backdrop-blur-sm' : ''}
    ${isDragging ? 'cursor-move shadow-xl scale-105' : ''}
    hover:shadow-lg
  `.trim();

  return (
    <div
      ref={elementRef}
      className={containerClasses}
      style={{
        ...style,
        zIndex: isSelected ? 20 : isEditing ? 25 : 10,
        touchAction: isDragging ? 'none' : 'auto'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDownForDrag}
      onTouchStart={!isEditing ? handleTouchStart : undefined}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onBlur={onEdit}
          style={textStyle}
          className="min-w-[150px] min-h-[50px] bg-transparent resize-none"
          rows={Math.max(1, localText.split('\n').length)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          style={textStyle}
          className="min-w-[150px] min-h-[50px] select-none"
        >
          {localText || 'Duplo clique para editar'}
        </div>
      )}
      
      {/* Indicadores visuais */}
      {isSelected && !isEditing && (
        <>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute -bottom-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Duplo clique para editar • Arraste para mover
          </div>
        </>
      )}
      
      {isEditing && (
        <div className="absolute -bottom-8 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Enter para salvar • Esc para cancelar
        </div>
      )}
    </div>
  );
};

export default DraggableText;
