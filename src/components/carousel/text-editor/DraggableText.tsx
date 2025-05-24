
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
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Garantir foco no textarea quando entra em modo de edição
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      console.log('[DraggableText] Entrando em modo de edição, focando textarea');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 0);
    }
  }, [isEditing]);

  // Handler para clique simples com timer para detectar duplo clique
  const handleSingleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isEditing) {
      console.log('[DraggableText] Clique ignorado - está em modo de edição');
      return;
    }

    console.log('[DraggableText] Clique simples detectado');

    // Se já existe um timer, é um duplo clique
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      console.log('[DraggableText] Duplo clique detectado - iniciando edição');
      onEdit();
      return;
    }

    // Configurar timer para clique simples
    const timer = setTimeout(() => {
      console.log('[DraggableText] Timer expirado - processando clique simples');
      if (!isSelected) {
        console.log('[DraggableText] Selecionando elemento');
        onSelect();
      }
      setClickTimer(null);
    }, 250); // 250ms para detectar duplo clique

    setClickTimer(timer);
  };

  // Handler dedicado para duplo clique (fallback)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[DraggableText] onDoubleClick disparado');
    
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }
    
    if (!isEditing) {
      console.log('[DraggableText] Iniciando edição via duplo clique');
      onEdit();
    }
  };

  // Handler para início do arrasto
  const handleMouseDownForDrag = (e: React.MouseEvent) => {
    if (isEditing) {
      console.log('[DraggableText] Mouse down ignorado - está em edição');
      e.stopPropagation();
      return;
    }

    // Só permite arrasto se o elemento já estiver selecionado
    if (isSelected && !isDragging) {
      console.log('[DraggableText] Iniciando arrasto');
      handleMouseDown(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    console.log('[DraggableText] Texto alterado:', newText);
    setLocalText(newText);
    onTextChange(newText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('[DraggableText] Tecla pressionada:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('[DraggableText] Enter pressionado - finalizando edição');
      onEdit();
    }
    if (e.key === 'Escape') {
      console.log('[DraggableText] Escape pressionado - cancelando edição');
      setLocalText(text);
      onEdit();
    }
  };

  const handleBlur = () => {
    console.log('[DraggableText] Textarea perdeu foco - finalizando edição');
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
    ${isEditing ? 'cursor-text' : isDragging ? 'cursor-move' : 'cursor-pointer'}
    ${isEditing ? '' : 'select-none'}
  `.trim();

  console.log('[DraggableText] Renderizando:', {
    id,
    fontFamily: styles.fontFamily,
    resolvedFontFamily: getFontFamily(styles.fontFamily),
    isSelected,
    isEditing,
    textColor: styles.textColor,
    isDragging
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
      onClick={handleSingleClick}
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
          onBlur={handleBlur}
          style={textStyle}
          className="min-w-[100px] min-h-[40px] bg-transparent resize-none"
          rows={1}
          onClick={(e) => e.stopPropagation()}
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
