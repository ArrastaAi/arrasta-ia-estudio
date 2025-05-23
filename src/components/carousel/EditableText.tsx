
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TextEditor from './TextEditor';

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

interface EditableTextProps {
  text: string;
  onTextChange: (newText: string, styles?: TextStyles) => void;
  onSplitText?: (textParts: string[]) => void;
  styles?: TextStyles;
  isEditing?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
  isSelected?: boolean;
}

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

// Função melhorada para manter a posição do cursor após a edição
const saveAndRestoreCursor = (element: HTMLElement, callback: () => void) => {
  if (!element || !window.getSelection) return;
  
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  
  // Salva a posição atual do cursor
  const range = selection.getRangeAt(0);
  const savedRange = range.cloneRange();
  const startContainer = savedRange.startContainer;
  const startOffset = savedRange.startOffset;
  
  // Executa a callback que pode alterar o DOM
  callback();
  
  // Tenta restaurar a posição do cursor
  try {
    // Verifica se o container ainda existe no DOM
    if (document.body.contains(startContainer)) {
      const newRange = document.createRange();
      
      // Defineise o range para a mesma posição que estava antes
      newRange.setStart(startContainer, startOffset);
      newRange.collapse(true);
      
      // Aplica o range
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  } catch (error) {
    console.error('Erro ao restaurar cursor:', error);
  }
};

const EditableText: React.FC<EditableTextProps> = ({
  text,
  onTextChange,
  onSplitText,
  styles,
  isEditing = false,
  onStartEditing,
  onFinishEditing,
  isSelected = false
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Detecta se estamos em um dispositivo touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
  // Valor padrão para os estilos se não forem fornecidos
  const defaultStyles: TextStyles = {
    isBold: false,
    isItalic: false,
    alignment: 'center',
    fontSize: 18,
    textColor: '#FFFFFF',
    hasBackground: false,
    backgroundColor: '#000000',
    backgroundOpacity: 50
  };
  
  // Usar os estilos fornecidos ou os padrões
  const effectiveStyles = styles || defaultStyles;

  // Atualiza o texto atual quando o texto prop muda
  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  // Atualiza os estilos quando estes mudam
  useEffect(() => {
    if (styles && contentEditableRef.current) {
      // Aplica novos estilos sem alterar o conteúdo
      const currentContent = contentEditableRef.current.innerText;
      setCurrentText(currentContent);
    }
  }, [styles]);
  
  // Atualiza os refs quando o modo de edição muda
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [isEditing]);
  
  // Função para abrir o editor completo quando necessário
  const openFullEditor = useCallback(() => {
    if (onFinishEditing) onFinishEditing();
    setIsEditorOpen(true);
    
    if (textContainerRef.current) {
      const rect = textContainerRef.current.getBoundingClientRect();
      setEditorPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  }, [onFinishEditing]);
  
  // Função para tratar clique no texto
  const handleTextClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    if (!isSelected && onStartEditing) {
      onStartEditing();
    } else if (isSelected && !isEditing && onStartEditing) {
      onStartEditing();
    }
  }, [isSelected, isEditing, onStartEditing]);
  
  // Função melhorada para manipular a edição de texto inline
  const handleContentChange = useCallback(() => {
    if (!contentEditableRef.current) return;
    
    const newText = contentEditableRef.current.innerText;
    
    // Usamos a função auxiliar para manter a posição do cursor
    saveAndRestoreCursor(contentEditableRef.current, () => {
      setCurrentText(newText);
      onTextChange(newText, effectiveStyles);
    });
    
    // Verificar se há 3 quebras de linha consecutivas ou 3 espaços consecutivos
    if ((newText.includes('\n\n\n') || newText.includes('   ')) && onSplitText) {
      let parts: string[];
      
      if (newText.includes('\n\n\n')) {
        parts = newText.split('\n\n\n')
          .map(part => part.trim())
          .filter(part => part.length > 0);
      } else {
        parts = newText.split('   ')
          .map(part => part.trim())
          .filter(part => part.length > 0);
      }
      
      if (parts.length > 1) {
        onSplitText(parts);
        if (onFinishEditing) onFinishEditing();
      }
    }
  }, [effectiveStyles, onTextChange, onSplitText, onFinishEditing]);
  
  // Handler para teclas específicas durante a edição
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Escape para cancelar a edição
    if (e.key === 'Escape' && onFinishEditing) {
      onFinishEditing();
    }
    
    // Enter + ctrl para aplicar
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (onFinishEditing) onFinishEditing();
    }
    
    // Ctrl+b para negrito
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onTextChange(currentText, { 
        ...effectiveStyles, 
        isBold: !effectiveStyles.isBold 
      });
    }
    
    // Ctrl+i para itálico
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onTextChange(currentText, { 
        ...effectiveStyles, 
        isItalic: !effectiveStyles.isItalic 
      });
    }
  }, [currentText, effectiveStyles, onFinishEditing, onTextChange]);
  
  // Função para lidar com o blur do elemento editável
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Não finalizar a edição imediatamente para permitir abrir o editor completo
    // ou outros controles
  }, []);
  
  // Salva o texto do editor completo
  const handleSaveText = useCallback((newText: string, newStyles: TextStyles) => {
    // Verificar se existem três quebras de linha consecutivas
    if ((newText.includes('\n\n\n') || newText.includes('   ')) && onSplitText) {
      // Dividir texto em partes separadas por três quebras de linha
      let parts: string[];
      
      if (newText.includes('\n\n\n')) {
        parts = newText.split('\n\n\n')
          .map(part => part.trim())
          .filter(part => part.length > 0);
      } else {
        parts = newText.split('   ')
          .map(part => part.trim())
          .filter(part => part.length > 0);
      }
      
      // Se temos múltiplas partes e a função onSplitText foi fornecida
      if (parts.length > 1) {
        onSplitText(parts);
      } else {
        // Caso contrário, apenas atualizar o texto normalmente
        onTextChange(newText, newStyles);
      }
    } else {
      // Atualização normal do texto
      onTextChange(newText, newStyles);
    }
    
    setIsEditorOpen(false);
  }, [onTextChange, onSplitText]);

  // Prepara o estilo CSS para o componente
  const getTextStyles = useCallback(() => {
    if (!styles) return {};
    
    return {
      fontWeight: styles.isBold ? 'bold' : 'normal',
      fontStyle: styles.isItalic ? 'italic' : 'normal',
      textAlign: styles.alignment,
      fontSize: `${styles.fontSize}px`,
      color: styles.textColor,
      backgroundColor: styles.hasBackground 
        ? `rgba(${hexToRgb(styles.backgroundColor)}, ${styles.backgroundOpacity / 100})` 
        : 'transparent',
      padding: styles.hasBackground ? '4px 8px' : '0',
      borderRadius: styles.hasBackground ? '4px' : '0',
      whiteSpace: 'pre-wrap',  // Permite quebras de linha no texto
      outline: isEditing ? '2px dashed rgba(255, 255, 255, 0.7)' : 'none', // Destaque visual quando em edição
      position: 'relative' as 'relative',
      userSelect: isEditing ? 'text' as 'text' : 'none' as 'none', // Permite seleção de texto apenas em modo de edição
      cursor: isEditing ? 'text' : 'default',
    };
  }, [styles, isEditing]);
  
  return (
    <div className="relative" ref={textContainerRef}>
      {/* Versão editável com contentEditable */}
      <div 
        ref={contentEditableRef}
        className={`p-2 transition-colors ${isEditing ? 'bg-gray-700/30' : 'hover:bg-gray-700/30'} rounded`}
        style={getTextStyles()}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onInput={handleContentChange}
        onClick={handleTextClick}
        onTouchStart={isTouchDevice ? handleTextClick : undefined}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
      >
        {currentText || <span className="text-gray-400 italic">Clique para editar texto</span>}
      </div>
      
      {/* Editor completo */}
      {isEditorOpen && (
        <TextEditor 
          initialText={currentText}
          initialStyles={effectiveStyles}
          onSave={handleSaveText}
          onClose={() => setIsEditorOpen(false)}
          position={editorPosition}
        />
      )}
      
      {/* Botão "Mais opções" */}
      {isEditing && (
        <div className="absolute right-2 bottom-2 z-10">
          <button 
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              openFullEditor();
            }}
          >
            Mais opções
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableText;
