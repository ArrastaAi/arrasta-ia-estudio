
import React from 'react';
import { TextStyleOptions } from "@/types/carousel.types";
import { BRAND_TEMPLATES, getTextHierarchyStyles, getIntelligentTextPosition, getIntelligentOverlayIntensity } from "@/utils/brandTemplates";
import PrimaryText from './PrimaryText';
import SecondaryText from './SecondaryText';
import CTAElement from './CTAElement';
import BrandElement from './BrandElement';

interface IntelligentTextRendererProps {
  text: string;
  textStyles: TextStyleOptions;
  imageAnalysis?: { hasDarkAreas: boolean; hasBrightAreas: boolean; aspectRatio: string | null };
  onTextChange?: (newText: string) => void;
  className?: string;
}

const IntelligentTextRenderer: React.FC<IntelligentTextRendererProps> = ({
  text,
  textStyles,
  imageAnalysis = { hasDarkAreas: true, hasBrightAreas: false, aspectRatio: null },
  onTextChange,
  className = ""
}) => {
  const template = BRAND_TEMPLATES[textStyles.brandStyle] || BRAND_TEMPLATES.predial_casa_nova;
  
  // Análise inteligente para posicionamento e overlay
  const intelligentPosition = textStyles.useIntelligentPositioning 
    ? getIntelligentTextPosition(imageAnalysis, template)
    : textStyles.textPosition;
    
  const intelligentOverlay = textStyles.useIntelligentPositioning
    ? getIntelligentOverlayIntensity(imageAnalysis, template)
    : textStyles.overlayIntensity;

  // Parse do texto para identificar hierarquia
  const parseTextContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    return lines.map((line, index) => {
      // Lógica baseada nos mockups da Predial Casa Nova
      if (index === 0 && lines.length > 1) {
        return { type: 'primary', content: line };
      } else if (index === lines.length - 1 && line.toLowerCase().includes('contato')) {
        return { type: 'cta', content: line };
      } else if (line.toLowerCase().includes('predial') || line.toLowerCase().includes('casa nova')) {
        return { type: 'brand', content: line };
      } else {
        return { type: 'secondary', content: line };
      }
    });
  };

  const textElements = parseTextContent(text);
  
  const getPositionClass = () => {
    switch (intelligentPosition) {
      case "top":
        return "items-start justify-start pt-6";
      case "center":
        return "items-center justify-center";
      case "bottom":
        return "items-end justify-end pb-6";
      default:
        return "items-center justify-center";
    }
  };

  const overlayStyle: React.CSSProperties = intelligentOverlay > 0 ? {
    backgroundColor: `rgba(0, 0, 0, ${intelligentOverlay / 100})`,
    backdropFilter: "blur(2px)"
  } : {};

  return (
    <div className={`relative w-full h-full flex flex-col ${getPositionClass()} ${className}`}>
      {/* Overlay inteligente */}
      {intelligentOverlay > 0 && (
        <div 
          className="absolute inset-0 rounded-md"
          style={overlayStyle}
        />
      )}
      
      {/* Conteúdo do texto */}
      <div className="relative z-10 text-center max-w-[90%] mx-auto space-y-2">
        {textElements.map((element, index) => {
          const hierarchyStyle = getTextHierarchyStyles(template, element.type);
          
          switch (element.type) {
            case 'primary':
              return (
                <PrimaryText key={index} style={hierarchyStyle}>
                  {element.content}
                </PrimaryText>
              );
            case 'secondary':
              return (
                <SecondaryText key={index} style={hierarchyStyle}>
                  {element.content}
                </SecondaryText>
              );
            case 'cta':
              return (
                <CTAElement key={index} style={hierarchyStyle}>
                  {element.content}
                </CTAElement>
              );
            case 'brand':
              return (
                <BrandElement key={index} style={hierarchyStyle}>
                  {element.content}
                </BrandElement>
              );
            default:
              return (
                <SecondaryText key={index} style={hierarchyStyle}>
                  {element.content}
                </SecondaryText>
              );
          }
        })}
      </div>
    </div>
  );
};

export default IntelligentTextRenderer;
