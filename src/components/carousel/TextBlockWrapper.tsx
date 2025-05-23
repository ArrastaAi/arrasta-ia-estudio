
import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from '@/hooks/useDrag';
import { cn } from '@/lib/utils';
import { Trash2, Move, Square } from 'lucide-react';

interface TextBlockWrapperProps {
  children: React.ReactNode;
  id: string;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLElement>;
  isEditing?: boolean;
}

const TextBlockWrapper: React.FC<TextBlockWrapperProps> = ({
  children,
  id,
  position,
  isSelected,
  onSelect,
  onDelete,
  onPositionChange,
  containerRef,
  isEditing = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [clickTime, setClickTime] = useState<number>(0);
  const [isDragArea, setIsDragArea] = useState(false);
  
  const { 
    isDragging, 
    handleMouseDown: originalHandleMouseDown, 
    handleTouchStart: originalHandleTouchStart,
    style 
  } = useDrag({
    initialPosition: position,
    containerRef,
    onPositionChange,
    boundToContainer: true,
    elementRef
  });
  
  // Limiar para diferenciar entre clique e arrasto (em milissegundos)
  const CLICK_THRESHOLD = 150;
  
  // Handler melhorado para o mouseDown que adiciona um pequeno delay para diferenciar clique de arrasto
  const handleMouseDown = (e: React.MouseEvent) => {
    // Evitar arrasto quando estiver em modo de edição
    if (isEditing) return;
    
    e.stopPropagation();
    setDragStartTime(Date.now());
    setIsDragArea(true);
    originalHandleMouseDown(e);
  };
  
  // Handler melhorado para o touchStart que adiciona um pequeno delay para diferenciar toque de arrasto
  const handleTouchStart = (e: React.TouchEvent) => {
    // Evitar arrasto quando estiver em modo de edição
    if (isEditing) return;
    
    e.stopPropagation();
    setDragStartTime(Date.now());
    setIsDragArea(true);
    originalHandleTouchStart(e);
  };
  
  // Efeito para limpar o estado de isDragArea após o arrasto
  useEffect(() => {
    if (!isDragging && isDragArea) {
      const timer = setTimeout(() => {
        setIsDragArea(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging, isDragArea]);
  
  // Determina se o bloco está no modo de arrasto ou de edição
  const isInteractive = isSelected && !isEditing;
  
  const handleClick = (e: React.MouseEvent) => {
    const now = Date.now();
    setClickTime(now);
    
    // Se já passou pouco tempo desde o início do arrasto, isso é um clique
    // e não um arrasto concluído
    if (!isDragging || (now - dragStartTime < CLICK_THRESHOLD)) {
      e.stopPropagation();
      onSelect();
    }
  };
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute transition-all duration-150",
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:ring-1 hover:ring-blue-300"
      )}
      style={{
        ...style,
        zIndex: isSelected ? 20 : 10,
        touchAction: isDragging ? 'none' : 'auto',
        userSelect: 'none',
        cursor: isDragArea && !isEditing ? 'grabbing' : isEditing ? 'text' : 'default'
      }}
      onClick={handleClick}
    >
      {/* Conteúdo do bloco */}
      <div className="relative">
        {children}
      </div>
      
      {/* Controles visíveis apenas quando o bloco está selecionado */}
      {isSelected && !isEditing && (
        <div 
          className="absolute -top-10 right-0 flex items-center space-x-1 bg-gray-800/80 backdrop-blur-sm rounded-md px-2 py-1 z-30"
        >
          <button
            className="text-white hover:text-red-400 p-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir bloco"
          >
            <Trash2 size={16} />
          </button>
          
          <div 
            className="text-white hover:text-blue-400 p-1 cursor-move transition-colors"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            title="Arrastar bloco"
          >
            <Move size={16} />
          </div>
        </div>
      )}
      
      {/* Alça de arrasto na borda quando selecionado */}
      {isSelected && !isEditing && (
        <div 
          className={cn(
            "absolute -bottom-3 -right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-se-resize",
            "hover:bg-blue-600 transition-colors shadow-md"
          )}
          title="Redimensionar"
        >
          <Square size={10} className="text-white" />
        </div>
      )}
      
      {/* Área de arrasto no topo - pequena e visível */}
      {isInteractive && (
        <div
          className="absolute top-0 left-0 right-0 h-6 cursor-move bg-blue-500/20 hover:bg-blue-500/30 rounded-t"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      )}
      
      {/* Área de arrasto quando já está arrastando - cobre todo o elemento */}
      {isDragging && isInteractive && (
        <div
          className="absolute inset-0 bg-transparent cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      )}
    </div>
  );
};

export default TextBlockWrapper;
