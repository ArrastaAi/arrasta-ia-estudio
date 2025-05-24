
import React from 'react';
import { TextHierarchyStyle } from "@/types/carousel.types";

interface BrandElementProps {
  children: React.ReactNode;
  style: TextHierarchyStyle;
  logo?: string;
  className?: string;
}

const BrandElement: React.FC<BrandElementProps> = ({ 
  children, 
  style, 
  logo, 
  className = "" 
}) => {
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
    lineHeight: 1.3
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logo && (
        <img 
          src={logo} 
          alt="Logo" 
          className="h-8 w-auto object-contain"
        />
      )}
      <span style={textStyle}>
        {children}
      </span>
    </div>
  );
};

export default BrandElement;
