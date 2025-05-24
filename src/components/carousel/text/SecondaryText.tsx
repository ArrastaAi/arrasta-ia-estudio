
import React from 'react';
import { TextHierarchyStyle } from "@/types/carousel.types";

interface SecondaryTextProps {
  children: React.ReactNode;
  style: TextHierarchyStyle;
  className?: string;
}

const SecondaryText: React.FC<SecondaryTextProps> = ({ children, style, className = "" }) => {
  const textStyle: React.CSSProperties = {
    fontWeight: style.fontWeight,
    fontSize: `${style.fontSize}px`,
    color: style.textColor,
    textTransform: style.textCase,
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
