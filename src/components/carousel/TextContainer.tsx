
import React, { useState, useEffect, useRef } from 'react';
import EditableText from './EditableText';
import TextBlockWrapper from './TextBlockWrapper';
import { cn } from '@/lib/utils';

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

interface TextBlock {
  id: string;
  text: string;
  styles: TextStyles;
  position: { x: number; y: number }; // Posições como percentuais
}

interface TextContainerProps {
  initialText: string;
  initialStyles: TextStyles;
  onTextChange: (newText: string) => void;
  activeTextStyle?: TextStyles;
}

const TextContainer: React.FC<TextContainerProps> = ({
  initialText,
  initialStyles,
  onTextChange,
  activeTextStyle
}) => {
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Monitora mudanças no tamanho do container
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Usar ResizeObserver para manter posições relativas
    const resizeObserver = new ResizeObserver(() => {
      // Não precisamos fazer nada aqui porque agora usamos posição percentual
      // que já se adapta automaticamente
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Inicializa com um único bloco com posição centralizada
  useEffect(() => {
    // Usar o activeTextStyle caso esteja disponível, senão usar initialStyles
    const stylestoUse = activeTextStyle || initialStyles;
    
    setTextBlocks([{
      id: crypto.randomUUID(),
      text: initialText,
      styles: stylestoUse,
      position: { x: 10, y: 10 } // Posição inicial em percentual
    }]);
  }, [initialText, initialStyles, activeTextStyle]);

  // Aplicar estilos quando activeTextStyle mudar
  useEffect(() => {
    if (!activeTextStyle) return;
    
    setTextBlocks(prev => 
      prev.map(block => ({
        ...block,
        styles: {
          ...block.styles,
          ...activeTextStyle
        }
      }))
    );
  }, [activeTextStyle]);

  const updateBlock = (id: string, newText: string, newStyles?: TextStyles) => {
    setTextBlocks(prev =>
      prev.map(block =>
        block.id === id
          ? {
              ...block,
              text: newText,
              styles: newStyles || block.styles
            }
          : block
      )
    );

    // Notifica o componente pai com texto atualizado
    updateParentText();
  };

  const updateBlockPosition = (id: string, newPosition: { x: number; y: number }) => {
    setTextBlocks(prev =>
      prev.map(block =>
        block.id === id
          ? {
              ...block,
              position: newPosition
            }
          : block
      )
    );
  };

  // Função melhorada para separar blocos com espaço vertical adequado
  const splitBlock = (id: string, textParts: string[]) => {
    setTextBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;

      // Obtém posição e estilo do bloco original
      const originPosition = prev[index].position;
      const originStyles = prev[index].styles;
      
      // Calcular a altura média de um bloco para espaçamento adequado
      const blockHeight = 20; // Valor aproximado em percentual
      
      // Cria novos blocos com posições ajustadas verticalmente
      const newBlocks: TextBlock[] = textParts.map((text, idx) => ({
        id: crypto.randomUUID(),
        text,
        styles: originStyles,
        // Posiciona verticalmente com espaçamento maior entre os blocos (em percentual)
        position: {
          x: originPosition.x,
          y: originPosition.y + (idx * (blockHeight + 5)) // 5% de espaço adicional entre os blocos
        }
      }));

      // Substitui o bloco original pelos novos
      const updatedBlocks = [
        ...prev.slice(0, index),
        ...newBlocks,
        ...prev.slice(index + 1)
      ];
      
      // Atualiza o texto no componente pai com um pequeno atraso
      setTimeout(() => updateParentText(), 0);
      
      return updatedBlocks;
    });
  };
  
  const deleteBlock = (id: string) => {
    setTextBlocks(prev => {
      // Remove o bloco com o id especificado
      const updatedBlocks = prev.filter(block => block.id !== id);
      
      // Se todos os blocos foram removidos, cria um bloco vazio
      if (updatedBlocks.length === 0) {
        return [{
          id: crypto.randomUUID(),
          text: "",
          styles: activeTextStyle || initialStyles,
          position: { x: 10, y: 10 } // Posição em percentual
        }];
      }
      
      return updatedBlocks;
    });
    
    // Limpa a seleção e atualiza o texto
    setSelectedBlockId(null);
    setEditingBlockId(null);
    setTimeout(() => updateParentText(), 0);
  };
  
  // Função para atualizar o texto no componente pai unindo todos os blocos
  const updateParentText = () => {
    const finalText = textBlocks.map(block => block.text).join('\n\n');
    onTextChange(finalText);
  };

  // Função para iniciar a edição de um bloco
  const handleStartEditing = (id: string) => {
    setSelectedBlockId(id);
    setEditingBlockId(id);
  };

  // Função para finalizar a edição de um bloco
  const handleFinishEditing = () => {
    setEditingBlockId(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[300px]"
      onClick={() => {
        setSelectedBlockId(null);
        setEditingBlockId(null);
      }} // Desseleciona ao clicar no container vazio
    >
      {textBlocks.map(block => (
        <TextBlockWrapper
          key={block.id}
          id={block.id}
          position={block.position}
          isSelected={selectedBlockId === block.id}
          isEditing={editingBlockId === block.id}
          onSelect={() => {
            setSelectedBlockId(block.id);
            // Não inicia edição automaticamente, só seleciona o bloco
          }}
          onDelete={() => deleteBlock(block.id)}
          onPositionChange={(position) => updateBlockPosition(block.id, position)}
          containerRef={containerRef}
        >
          <EditableText
            key={`edit-${block.id}`}
            text={block.text}
            styles={block.styles}
            onTextChange={(newText, newStyles) => updateBlock(block.id, newText, newStyles)}
            onSplitText={(parts) => splitBlock(block.id, parts)}
            isEditing={editingBlockId === block.id}
            onStartEditing={() => handleStartEditing(block.id)}
            onFinishEditing={handleFinishEditing}
            isSelected={selectedBlockId === block.id}
          />
        </TextBlockWrapper>
      ))}
    </div>
  );
};

export default TextContainer;
