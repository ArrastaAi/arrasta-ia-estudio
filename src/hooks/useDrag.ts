
import { useState, useCallback, useEffect, RefObject, useMemo } from 'react';

interface Position {
  x: number; // em percentual (0-100)
  y: number; // em percentual (0-100)
}

interface UseDragProps {
  initialPosition: Position;
  containerRef?: RefObject<HTMLElement>;
  onPositionChange?: (position: Position) => void;
  boundToContainer?: boolean;
  elementRef?: RefObject<HTMLElement>;
}

export function useDrag({
  initialPosition = { x: 10, y: 10 }, // valores iniciais em percentagem
  containerRef,
  onPositionChange,
  boundToContainer = true,
  elementRef
}: UseDragProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Detecta se estamos em um dispositivo touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Converte coordenadas absolutas para percentuais
  const convertToPercentage = useCallback((x: number, y: number): Position => {
    if (!containerRef?.current) return { x, y };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: (x / containerRect.width) * 100,
      y: (y / containerRect.height) * 100
    };
  }, [containerRef]);

  // Converte coordenadas percentuais para absolutas
  const convertToAbsolute = useCallback((position: Position): { x: number, y: number } => {
    if (!containerRef?.current) return { x: 0, y: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: (position.x / 100) * containerRect.width,
      y: (position.y / 100) * containerRect.height
    };
  }, [containerRef]);

  // Calcula as dimensões do elemento que está sendo arrastado
  const getElementSize = useCallback(() => {
    if (!elementRef?.current) {
      // Valores padrão se não tivermos acesso ao elemento
      return { width: 20, height: 10 }; // valores em percentagem
    }
    
    const elementRect = elementRef.current.getBoundingClientRect();
    const containerRect = containerRef?.current?.getBoundingClientRect();
    
    if (!containerRect) return { width: 20, height: 10 };
    
    return {
      width: (elementRect.width / containerRect.width) * 100,
      height: (elementRect.height / containerRect.height) * 100
    };
  }, [elementRef, containerRef]);

  // Handler para início do arrasto (mouse) com melhor gerenciamento de eventos
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef?.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const element = e.currentTarget as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    
    // Calcula o offset em coordenadas absolutas
    const offsetX = e.clientX - elementRect.left;
    const offsetY = e.clientY - elementRect.top;
    
    // Converte para percentual
    setDragOffset({
      x: (offsetX / containerRect.width) * 100,
      y: (offsetY / containerRect.height) * 100
    });
    
    setIsDragging(true);
  }, [containerRef]);

  // Handler para início do arrasto (touch) com melhor gerenciamento de eventos
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    
    // Diferenciar entre toque para seleção e para arrasto
    const now = Date.now();
    setLastTouchTime(now);
    
    if (!containerRef?.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const element = e.currentTarget as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Calcula o offset em coordenadas absolutas
    const offsetX = touch.clientX - elementRect.left;
    const offsetY = touch.clientY - elementRect.top;
    
    // Converte para percentual
    setDragOffset({
      x: (offsetX / containerRect.width) * 100,
      y: (offsetY / containerRect.height) * 100
    });
    
    // Inicia o arrasto imediatamente para evitar atrasos perceptíveis
    setIsDragging(true);
  }, [containerRef]);

  // Effect para monitorar o movimento do mouse/touch durante o arrasto
  useEffect(() => {
    if (!isDragging || !containerRef?.current) return;

    const elementSize = getElementSize();
    
    // Handler para movimento do mouse com melhor desempenho
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef?.current) return;
      
      // Otimização: Usa requestAnimationFrame para limitar atualizações
      window.requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        
        // Calcula a nova posição em coordenadas absolutas
        let newXAbs = e.clientX - (dragOffset.x / 100 * containerRect.width);
        let newYAbs = e.clientY - (dragOffset.y / 100 * containerRect.height);
        
        // Converte para percentual
        let newX = (newXAbs / containerRect.width) * 100;
        let newY = (newYAbs / containerRect.height) * 100;
        
        // Restringe o movimento dentro do container se necessário
        if (boundToContainer) {
          newX = Math.max(0, Math.min(newX, 100 - elementSize.width));
          newY = Math.max(0, Math.min(newY, 100 - elementSize.height));
        }
        
        setPosition({ x: newX, y: newY });
      });
    };

    // Handler para movimento de touch com melhor desempenho
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef?.current) return;
      
      // Previne rolagem da página durante o arrasto
      e.preventDefault();
      
      // Otimização: Usa requestAnimationFrame para limitar atualizações
      window.requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const touch = e.touches[0];
        
        // Calcula a nova posição em coordenadas absolutas
        let newXAbs = touch.clientX - (dragOffset.x / 100 * containerRect.width);
        let newYAbs = touch.clientY - (dragOffset.y / 100 * containerRect.height);
        
        // Converte para percentual
        let newX = (newXAbs / containerRect.width) * 100;
        let newY = (newYAbs / containerRect.height) * 100;
        
        // Restringe o movimento dentro do container se necessário
        if (boundToContainer) {
          newX = Math.max(0, Math.min(newX, 100 - elementSize.width));
          newY = Math.max(0, Math.min(newY, 100 - elementSize.height));
        }
        
        setPosition({ x: newX, y: newY });
      });
    };

    // Handler para finalização do arrasto
    const handleMouseUp = () => {
      if (isDragging && onPositionChange) {
        onPositionChange(position);
      }
      setIsDragging(false);
    };

    // Handler para finalização do arrasto (touch)
    const handleTouchEnd = () => {
      if (isDragging && onPositionChange) {
        onPositionChange(position);
      }
      setIsDragging(false);
      setLastTouchTime(0);
    };

    // Adiciona os event listeners apropriados
    if (isTouchDevice) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Remove event listeners quando o componente é desmontado ou o estado muda
    return () => {
      if (isTouchDevice) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging, dragOffset, containerRef, onPositionChange, position, boundToContainer, getElementSize, isTouchDevice]);

  // Retorna o estilo CSS calculado para o elemento
  const style = useMemo(() => {
    return {
      left: `${position.x}%`,
      top: `${position.y}%`,
    };
  }, [position]);

  return { 
    position,
    isDragging, 
    handleMouseDown, 
    handleTouchStart,
    setPosition,
    style,
    convertToPercentage,
    convertToAbsolute
  };
}
