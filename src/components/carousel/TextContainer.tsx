
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
  activeTextStyle?: TextStyles;
}

const TextContainer: React.FC<TextContainerProps> = ({
  initialText,
  onTextChange
}) => {
  console.log('TextContainer renderizado com texto inicial:', initialText);

  const handleTextChange = (newText: string) => {
    console.log('Texto alterado no editor:', newText);
    onTextChange(newText);
  };

  return (
    <div className="w-full h-full relative">
      <SimpleTextEditor
        initialText={initialText}
        onTextChange={handleTextChange}
        className="min-h-[300px] w-full h-full"
      />
    </div>
  );
};

export default TextContainer;
