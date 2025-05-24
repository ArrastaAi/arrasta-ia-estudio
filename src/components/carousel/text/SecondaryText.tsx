
import React from 'react';
import { TextHierarchyStyle } from "@/types/carousel.types";

interface SecondaryTextProps {
  children: React.ReactNode;
  style: TextHierarchyStyle;
  className?: string;
}

const SecondaryText: React.FC<SecondaryTextProps> = ({ children, style, className = "" }) => {
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
    lineHeight: 1.4,
    textShadow: "0 1px 2px rgba(0,0,0,0.2)"
  };

  return (
    <p 
      className={`${className}`}
      style={textStyle}
    >
      {children}
    </p>
  );
};

export default SecondaryText;
