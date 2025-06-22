
import React from 'react';
import SimpleTextEditor from './text-editor/SimpleTextEditor';

interface TextStyles {
  fontSize: number;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  fontFamily?: string;
}

interface TextContainerProps {
  initialText: string;
  initialStyles: any;
  onTextChange: (newText: string) => void;
  activeTextStyle?: any;
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

  // Converter TextStyleOptions para TextStyles usado pelo editor
  const convertToEditorStyles = (styleOptions: any): TextStyles => {
    if (!styleOptions) {
      return {
        fontSize: 24,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'helvetica'
      };
    }

    return {
      fontSize: styleOptions.fontSize || 24,
      textColor: styleOptions.textColor || '#FFFFFF',
      fontWeight: styleOptions.fontWeight === 'bold' ? 'bold' : 'normal',
      textAlign: styleOptions.alignment || 'center',
      fontFamily: styleOptions.fontFamily || 'helvetica'
    };
  };

  const handleTextChange = (newText: string) => {
    console.log('[TextContainer] Texto alterado no editor:', newText);
    onTextChange(newText);
  };

  const editorStyles = convertToEditorStyles(activeTextStyle);
  console.log('[TextContainer] Estilos convertidos para o editor:', editorStyles);

  return (
    <div className="w-full h-full relative">
      <SimpleTextEditor
        initialText={initialText}
        onTextChange={handleTextChange}
        className="min-h-[300px] w-full h-full"
        globalTextStyles={editorStyles}
      />
    </div>
  );
};

export default TextContainer;
