
import React from 'react';
import { TextHierarchyStyle } from "@/types/carousel.types";

interface PrimaryTextProps {
  children: React.ReactNode;
  style: TextHierarchyStyle;
  className?: string;
}

const PrimaryText: React.FC<PrimaryTextProps> = ({ children, style, className = "" }) => {
  const getTextTransform = (textCase: string): React.CSSProperties['textTransform'] => {
    switch (textCase) {
      case "uppercase":
        return "uppercase";
      case "lowercase":
        return "lowercase";
      case "capitalize":
        return "capitalize";
      default:
        return "none";
    }
  };

  const textStyle: React.CSSProperties = {
    fontWeight: style.fontWeight,
    fontSize: `${style.fontSize}px`,
    color: style.textColor,
    textTransform: getTextTransform(style.textCase),
    letterSpacing: `${style.letterSpacing}em`,
    marginBottom: `${style.marginBottom}px`,
    lineHeight: 1.2,
    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
  };

  return (
    <h1 
      className={`font-bold tracking-wide ${className}`}
      style={textStyle}
    >
      {children}
    </h1>
  );
};

export default PrimaryText;
