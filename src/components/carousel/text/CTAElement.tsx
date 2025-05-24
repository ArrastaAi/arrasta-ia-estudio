
import React from 'react';
import { TextHierarchyStyle } from "@/types/carousel.types";

interface CTAElementProps {
  children: React.ReactNode;
  style: TextHierarchyStyle;
  onClick?: () => void;
  variant?: "button" | "text";
  className?: string;
}

const CTAElement: React.FC<CTAElementProps> = ({ 
  children, 
  style, 
  onClick, 
  variant = "button", 
  className = "" 
}) => {
  const baseStyle: React.CSSProperties = {
    fontWeight: style.fontWeight,
    fontSize: `${style.fontSize}px`,
    color: style.textColor,
    textTransform: style.textCase,
    letterSpacing: `${style.letterSpacing}em`,
    lineHeight: 1.3
  };

  if (variant === "button") {
    return (
      <button 
        className={`px-6 py-3 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${className}`}
        style={{
          ...baseStyle,
          backgroundColor: style.textColor === "#FF6B35" ? "#FF6B35" : "transparent",
          border: `2px solid ${style.textColor}`,
          color: style.textColor === "#FF6B35" ? "#FFFFFF" : style.textColor
        }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

export default CTAElement;
