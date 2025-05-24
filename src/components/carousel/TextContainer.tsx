
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
  return (
    <SimpleTextEditor
      initialText={initialText}
      onTextChange={onTextChange}
      className="min-h-[300px]"
    />
  );
};

export default TextContainer;
