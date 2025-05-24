
import React from 'react';
import SimpleTextEditor from './text-editor/SimpleTextEditor';

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

interface TextContainerProps {
  initialText: string;
  initialStyles: TextStyles;
  onTextChange: (newText: string) => void;
  activeTextStyle?: any; // Receber estilos ativos do Editor
}

const TextContainer: React.FC<TextContainerProps> = ({
  initialText,
  onTextChange,
  activeTextStyle
}) => {
  console.log('[TextContainer] Renderizado com:', {
    initialText,
    activeTextStyle
  });

  const handleTextChange = (newText: string) => {
    console.log('[TextContainer] Texto alterado no editor:', newText);
    onTextChange(newText);
  };

  return (
    <div className="w-full h-full relative">
      <SimpleTextEditor
        initialText={initialText}
        onTextChange={handleTextChange}
        className="min-h-[300px] w-full h-full"
        globalTextStyles={activeTextStyle} // Passar estilos globais
      />
    </div>
  );
};

export default TextContainer;
