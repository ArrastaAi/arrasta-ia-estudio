
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect();
    } else if (!isEditing) {
      onEdit();
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
      onEdit(); // Sai do modo de edição
    }
    if (e.key === 'Escape') {
      setLocalText(text); // Reverte mudanças
      onEdit(); // Sai do modo de edição
    }
  };

  const handleBlur = () => {
    onEdit(); // Sai do modo de edição ao perder foco
  };

  const getFontClassName = (fontFamily?: string) => {
    switch (fontFamily) {
      case 'pacifico': return 'font-pacifico';
      case 'bebas': return 'font-bebas';
      case 'brusher': return 'font-brusher';
      case 'selima': return 'font-selima';
      case 'fixture': return 'font-fixture';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-helvetica';
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
    fontFamily: 'inherit'
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${getFontClassName(styles.fontFamily)} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        ...style,
        zIndex: isSelected ? 20 : 10,
        touchAction: isDragging ? 'none' : 'auto'
      }}
      onClick={handleClick}
      onMouseDown={!isEditing ? handleMouseDown : undefined}
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
          className="min-w-[100px] min-h-[40px]"
          rows={1}
        />
      ) : (
        <div
          style={textStyle}
          className="min-w-[100px] min-h-[40px] cursor-text"
        >
          {localText || 'Clique para editar'}
        </div>
      )}
      
      {/* Indicador visual quando selecionado */}
      {isSelected && !isEditing && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

export default DraggableText;
