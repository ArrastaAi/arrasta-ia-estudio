import React, { useEffect, useState } from 'react';
import { Slide } from "@/types/database.types";
import { TextStyleOptions } from "@/types/carousel.types";
import TextContainer from '@/components/carousel/TextContainer';
import { 
  ImageInfo, 
  adaptContentToModel, 
  analyzeImageBrightness, 
  detectImageAspectRatio, 
  determineOptimalTextPosition, 
  determineFontFamily 
} from "@/utils/layoutStyleUtils";

// Função para converter hex para rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

interface SlideContentProps {
  slide: Slide;
  index: number;
  layoutType: string;
  textStyles: TextStyleOptions;
  onContentUpdate?: (newContent: string) => void;
}

const SlideContent: React.FC<SlideContentProps> = ({ 
  slide, 
  index, 
  layoutType, 
  textStyles,
  onContentUpdate 
}) => {
  // Estados para armazenar informações da imagem e estilos otimizados
  const [imageInfo, setImageInfo] = useState<ImageInfo>({
    url: slide.image_url,
    aspectRatio: null,
    hasDarkAreas: true,
    hasBrightAreas: false
  });
  
  const [adaptedContent, setAdaptedContent] = useState<string>(slide.content || "");
  const [optimalTextPosition, setOptimalTextPosition] = useState<string>(textStyles.textPosition);
  const [optimalFontFamily, setOptimalFontFamily] = useState<string>(textStyles.fontFamily);
  
  // Renderizar os blocos de texto
  const renderTextContent = () => {
    if (!adaptedContent || adaptedContent.trim() === "") return null;
    
    // Para formatos especiais, manter o comportamento original
    if (layoutType === 'statistics') {
      return formatStatisticsContent(adaptedContent);
    } else if (['twitter', 'facebook', 'linkedin'].includes(layoutType)) {
      return formatSocialMediaContent(adaptedContent);
    }
    
    // Para layouts regulares, usar o TextContainer com suporte a múltiplos blocos
    // e posicionamento absoluto
    return (
      <TextContainer 
        initialText={adaptedContent}
        initialStyles={getTextBlockStyles()}
        activeTextStyle={getTextBlockStyles()} // Passar estilos ativos
        onTextChange={handleTextUpdate}
      />
    );
  };

  // Analisa a imagem ao carregar ou quando a imagem muda
  useEffect(() => {
    const analyzeImage = async () => {
      if (slide.image_url) {
        const aspectRatio = await detectImageAspectRatio(slide.image_url);
        const brightness = await analyzeImageBrightness(slide.image_url);
        
        setImageInfo({
          url: slide.image_url,
          aspectRatio,
          hasDarkAreas: brightness.hasDarkAreas,
          hasBrightAreas: brightness.hasBrightAreas
        });
        
        // Atualiza posicionamento de texto com base na análise da imagem
        const newPosition = determineOptimalTextPosition(
          {url: slide.image_url, aspectRatio, ...brightness},
          layoutType
        );
        setOptimalTextPosition(newPosition);
        
        // Corrigido: Passar o índice do slide como número e um booleano para indicar título
        const newFontFamily = determineFontFamily(layoutType, index === 0);
        setOptimalFontFamily(newFontFamily);
        
        // Adapta o conteúdo para o modelo específico
        const newContent = adaptContentToModel(slide.content, layoutType);
        setAdaptedContent(newContent);
      } else {
        // Redefine para valores padrão se não houver imagem
        setImageInfo({
          url: null,
          aspectRatio: null,
          hasDarkAreas: true,
          hasBrightAreas: false
        });
        setOptimalTextPosition(textStyles.textPosition);
        setOptimalFontFamily(textStyles.fontFamily);
        setAdaptedContent(slide.content || "");
      }
    };
    
    analyzeImage();
  }, [slide.image_url, layoutType, slide.content, index, textStyles.textPosition, textStyles.fontFamily]);
  
  // Verificar se é um layout de livro
  const isBookLayout = ['fiction_cover', 'nonfiction_cover', 'memoir', 'self_help', 'academic', 'thriller'].includes(layoutType);
  const isSocialMedia = ['feed_square', 'stories', 'instagram_rect', 'tiktok', 'facebook', 'twitter', 'linkedin', 'youtube'].includes(layoutType);
  
  // Handle text update
  const handleTextUpdate = (newText: string) => {
    if (onContentUpdate) {
      onContentUpdate(newText);
    }
  };

  // Função para obter estilo base de texto usando a família de fonte otimizada e layout
  const getTextStyles = () => {
    const baseStyles = `font-${optimalFontFamily} tracking-tight z-10 relative`;
    
    if (isBookLayout) {
      return `${baseStyles} text-xl md:text-2xl font-bold`;
    } else if (layoutType === 'manifesto' || layoutType === 'editorial') {
      return `${baseStyles} text-xl md:text-2xl font-bold`;
    } else if (layoutType === 'statistics') {
      return `${baseStyles} text-2xl md:text-3xl font-extrabold`;
    } else if (layoutType === 'quote') {
      return `${baseStyles} text-lg md:text-xl font-medium italic`;
    } else if (layoutType === 'long_form') {
      return `${baseStyles} text-sm md:text-md`;
    } else if (index === 0) {
      return `${baseStyles} text-lg md:text-xl font-bold`;
    } else if (index === Number.MAX_SAFE_INTEGER) { // Último slide, valor será substituído no uso
      return `${baseStyles} text-lg font-medium`;
    } else {
      return `${baseStyles} text-md`;
    }
  };

  // Função para obter estilo de contêiner para o texto, usando posicionamento otimizado
  const getTextContainerStyles = () => {
    const hasImage = !!slide.image_url;
    let styles = "";
    
    // Alinhamento de texto - Primeiro prioriza alinhamento do usuário, depois usa o padrão do modelo
    if (textStyles.alignment === "left") {
      styles += "text-left ";
    } else if (textStyles.alignment === "center") {
      styles += "text-center ";
    } else if (textStyles.alignment === "right") {
      styles += "text-right ";
    } else if (isBookLayout) {
      styles += "text-center "; // Padrão para livros é centralizado
    } else if (layoutType === 'facebook' || layoutType === 'twitter') {
      styles += "text-left "; // Padrão para alguns formatos sociais é à esquerda
    } else {
      styles += "text-center "; // Padrão geral é centralizado
    }
    
    // Estilo de fundo - aplicar apenas se houver conteúdo e não for layout de livro
    // Ou se a imagem tiver áreas claras e escuras o que dificulta leitura
    const needsBackground = hasImage && imageInfo.hasBrightAreas && imageInfo.hasDarkAreas;
    
    if ((textStyles.hasBackground || needsBackground) && !isBookLayout) {
      styles += `${hasImage ? 'backdrop-blur-sm ' : ''} rounded-md `;
    }

    // Padding - ajustado para layouts de livro e redes sociais
    if (isBookLayout) {
      styles += "p-4 md:p-6 ";
    } else if (layoutType === 'stories' || layoutType === 'tiktok') {
      styles += "p-2 md:p-3 "; // Menos padding para formatos verticais
    } else {
      styles += "p-3 md:p-4 ";
    }
    
    // Largura
    if (isBookLayout) {
      styles += "w-full ";
    } else if (layoutType === 'stories' || layoutType === 'tiktok') {
      styles += "max-w-[85%] mx-auto "; // Mais estreito para formatos verticais
    } else if (layoutType === 'facebook' || layoutType === 'youtube') {
      styles += "max-w-[95%] mx-auto "; // Mais largo para formatos horizontais
    } else {
      styles += "max-w-[90%] mx-auto ";
    }
    
    // Estilos específicos para layouts especiais
    if (layoutType === 'manifesto' || layoutType === 'quote' || layoutType === 'statistics') {
      styles += "font-bold ";
    }
    
    return styles;
  };
  
  // Função para obter classe de posicionamento de texto, usando o posicionamento otimizado
  const getTextPositionClass = () => {
    // Se temos um posicionamento otimizado, usamos ele
    if (optimalTextPosition) {
      switch (optimalTextPosition) {
        case "top":
          return "items-start pt-6";
        case "center":
          return "items-center";
        case "bottom":
          return "items-end pb-6";
      }
    }
    
    // Caso não tenhamos um posicionamento otimizado, usamos a lógica de fallback
    
    // Para layouts de livro, o posicionamento depende do tipo específico
    if (isBookLayout) {
      if (layoutType === 'fiction_cover' || layoutType === 'thriller') {
        return "items-end justify-center pb-6";
      } else if (layoutType === 'memoir' || layoutType === 'self_help') {
        return "items-center justify-center";
      } else {
        return "items-center justify-between"; // Para layouts como nonfiction_cover e academic
      }
    }
    
    // Posicionamentos para redes sociais específicas
    if (layoutType === 'stories' || layoutType === 'tiktok') {
      return "items-center pt-12"; // Centralizado mas abaixo do topo para Stories/TikTok
    } else if (layoutType === 'facebook' || layoutType === 'youtube') {
      return "items-start pt-4"; // Alinhado ao topo para formatos horizontais
    } else if (layoutType === 'twitter') {
      return "items-start pt-2"; // Mais próximo ao topo para Twitter
    }
    
    // Substituições específicas para layouts editoriais
    if (layoutType === 'quote' || layoutType === 'statistics') {
      return "items-center"; // Sempre centralizado para citações e estatísticas
    } else if (layoutType === 'manifesto' || layoutType === 'editorial') {
      return "items-start pt-6"; // Alinhado ao topo para manifestos
    } else if (layoutType === 'case_study') {
      return "items-end pb-6"; // Alinhado ao fundo para estudos de caso
    } else if (layoutType === 'long_form') {
      return "items-start pt-4"; // Alinhado ao topo para texto longo
    }
    
    // Comportamento padrão para outros layouts, baseado nas preferências do usuário
    switch (textStyles.textPosition) {
      case "top":
        return "items-start pt-6";
      case "center":
        return "items-center";
      case "bottom":
        return "items-end pb-6";
      default:
        return "items-center";
    }
  };
  
  // Gera estilos inline para elementos de texto
  const getInlineTextStyles = () => {
    const styles: React.CSSProperties = {
      fontSize: `${textStyles.fontSize}px`,
      color: "#ffffff", // Garante que o texto é branco para melhor visibilidade
      textShadow: "0 1px 2px rgba(0,0,0,0.6)" // Adiciona sombra para melhor legibilidade em qualquer fundo
    };

    // Ajustes específicos para redes sociais
    if (layoutType === 'stories' || layoutType === 'tiktok') {
      styles.fontSize = `${textStyles.fontSize * 1.2}px`; // Fonte maior para formatos verticais
      styles.textShadow = "0 2px 4px rgba(0,0,0,0.8)"; // Sombra mais forte para melhor legibilidade
    } else if (layoutType === 'twitter') {
      styles.fontSize = `${textStyles.fontSize * 0.9}px`; // Fonte menor para Twitter
      styles.lineHeight = '1.5';
    } else if (layoutType === 'facebook' || layoutType === 'youtube') {
      styles.fontSize = `${textStyles.fontSize * 1.1}px`; // Fonte ligeiramente maior
      styles.lineHeight = '1.4';
    }
    
    // Ajustes para layouts de livro
    if (isBookLayout) {
      if (layoutType === 'nonfiction_cover' || layoutType === 'academic') {
        styles.color = "#000000";
        styles.textShadow = "none";
      }
      
      if (layoutType === 'fiction_cover' || layoutType === 'thriller') {
        styles.fontSize = `${textStyles.fontSize * 1.8}px`;
        styles.fontWeight = 800;
      } else if (layoutType === 'memoir' || layoutType === 'self_help') {
        styles.fontSize = `${textStyles.fontSize * 1.5}px`;
        styles.fontWeight = 700;
      }
    }
    // Ajustes de fonte para layouts editoriais
    else if (layoutType === 'statistics') {
      styles.fontSize = `${textStyles.fontSize * 2}px`;
      styles.fontWeight = 800;
    } else if (layoutType === 'manifesto' || layoutType === 'editorial') {
      styles.fontSize = `${textStyles.fontSize * 1.5}px`;
      styles.fontWeight = 700;
    } else if (layoutType === 'quote') {
      styles.fontStyle = 'italic';
    } else if (layoutType === 'long_form') {
      styles.fontSize = `${textStyles.fontSize * 0.9}px`;
      styles.lineHeight = '1.6';
    }
    
    // Adiciona contorno de texto se habilitado ou se a imagem tiver áreas claras
    if (textStyles.hasOutline || (imageInfo.hasBrightAreas && !imageInfo.hasDarkAreas)) {
      const outlineWidth = textStyles.outlineWidth;
      const outlineColor = textStyles.outlineColor;
      styles.textShadow = `
        -${outlineWidth}px -${outlineWidth}px 0 ${outlineColor},
        ${outlineWidth}px -${outlineWidth}px 0 ${outlineColor},
        -${outlineWidth}px ${outlineWidth}px 0 ${outlineColor},
        ${outlineWidth}px ${outlineWidth}px 0 ${outlineColor}
      `;
    }
    
    return styles;
  };
  
  // Gera estilos de fundo, adaptando com base na imagem
  const getBackgroundStyles = () => {
    // Se a imagem tem áreas claras e escuras, pode precisar de background para legibilidade
    const needsBackground = imageInfo.hasBrightAreas && imageInfo.hasDarkAreas;
    
    // Para layouts de redes sociais
    if (layoutType === 'stories' || layoutType === 'tiktok') {
      return { backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" };
    } else if (layoutType === 'facebook') {
      return { backgroundColor: "rgba(24, 119, 242, 0.15)", backdropFilter: "blur(3px)" };
    } else if (layoutType === 'twitter') {
      return { backgroundColor: "rgba(29, 161, 242, 0.15)", backdropFilter: "blur(3px)" };
    }
  
    // Para layouts de livro
    if (isBookLayout) {
      if (layoutType === 'fiction_cover') {
        return { background: "linear-gradient(to bottom, #1a365d, #4a148c)" };
      } else if (layoutType === 'thriller') {
        return { backgroundColor: "#000000" };
      } else if (layoutType === 'memoir') {
        return { backgroundColor: "rgba(55, 55, 55, 1)" };
      } else if (layoutType === 'self_help') {
        return { background: "linear-gradient(to right, #ed8936, #ecc94b)" };
      } else if (layoutType === 'academic') {
        return { backgroundColor: "#ffffff" };
      } else if (layoutType === 'nonfiction_cover') {
        return { backgroundColor: "#f7fafc" };
      }
    }
    // Para layouts editoriais
    else if (layoutType === 'manifesto') {
      return { backgroundColor: "rgba(255, 87, 34, 0.85)" };
    } else if (layoutType === 'editorial') {
      return { backgroundColor: "rgba(33, 33, 33, 0.8)" };
    } else if (layoutType === 'statistics') {
      return { backgroundColor: "rgba(13, 71, 161, 0.7)" };
    } else if (layoutType === 'quote') {
      return { backgroundColor: "rgba(71, 46, 34, 0.7)" };
    } else if (layoutType === 'case_study') {
      return { backgroundColor: "rgba(255, 87, 34, 0.7)" };
    } else if (layoutType === 'long_form') {
      return { backgroundColor: "rgba(33, 33, 33, 0.7)" };
    }
    
    // Se o slide tem uma cor de fundo definida, usa-a
    if (slide.background_type === "color" && slide.background_value) {
      return {
        backgroundColor: slide.background_value
      };
    }
    
    // Se a imagem precisa de fundo para melhor legibilidade ou está configurado pelo usuário
    if (needsBackground || textStyles.hasBackground) {
      const opacity = textStyles.backgroundOpacity / 100;
      const backgroundColor = textStyles.backgroundColor;
      
      // Converte hex para rgba para transparência
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      return {
        backgroundColor: hexToRgba(backgroundColor, opacity)
      };
    }
    
    // Padrão: fundo preto semitransparente para texto
    return {
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    };
  };

  // Formatar conteúdo para redes sociais específicas
  const formatSocialMediaContent = (content: string) => {
    if (!content) return content;
    
    if (layoutType === 'twitter') {
      // Formato típico de tweet
      return (
        <>
          <div className="text-sm mb-2">{content}</div>
          {Math.random() > 0.5 && <div className="text-xs text-blue-300">#hashtag</div>}
        </>
      );
    } else if (layoutType === 'facebook' || layoutType === 'linkedin') {
      // Formato para posts mais longos
      const firstParagraph = content.split('\n')[0] || content;
      return (
        <>
          <div className="font-medium mb-1">{firstParagraph}</div>
          {content.length > firstParagraph.length && 
            <div className="text-sm text-gray-300">Ver mais...</div>
          }
        </>
      );
    }
    
    return content;
  };

  // Função para formatar estatísticas com destaque
  const formatStatisticsContent = (content: string) => {
    if (layoutType !== 'statistics' || !content) return content;
    
    // Tenta extrair números e destacá-los
    const matches = content.match(/(\d+[.,]?\d*\s*%?)/);
    if (matches && matches[1]) {
      const number = matches[1];
      const restOfContent = content.replace(number, '');
      return (
        <>
          <div className="text-4xl font-bold mb-2">{number}</div>
          <div className="text-sm">{restOfContent}</div>
        </>
      );
    }
    
    return content;
  };

  // Renderiza o conteúdo para layouts de livros
  const renderBookContent = () => {
    if (!isBookLayout) return null;
    
    switch(layoutType) {
      case 'fiction_cover':
        return (
          <div className="w-full h-full bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col justify-end p-4">
            {slide.image_url && (
              <div className="absolute inset-0 opacity-30">
                <img src={slide.image_url} alt="Capa" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-1 text-center relative z-10">
              {adaptedContent || "TÍTULO DO LIVRO"}
            </h2>
            <p className="text-sm text-gray-300 text-center relative z-10">AUTOR</p>
          </div>
        );
        
      case 'nonfiction_cover':
        return (
          <div className="w-full h-full bg-gray-100 flex flex-col justify-between">
            {slide.image_url && (
              <div className="absolute inset-0">
                <img src={slide.image_url} alt="Capa" className="w-full h-1/2 object-cover opacity-60" style={{objectPosition: 'center'}} />
              </div>
            )}
            <div className="bg-red-700 p-2 text-white font-bold relative z-10">
              NEW YORK TIMES BEST-SELLER
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                {adaptedContent || "TÍTULO PRINCIPAL"}
              </h2>
              <p className="text-sm text-gray-600 text-center">Subtítulo Explicativo</p>
            </div>
            <div className="bg-gray-800 p-2 text-white text-center relative z-10">
              NOME DO AUTOR
            </div>
          </div>
        );
        
      case 'memoir':
        return (
          <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-500">
              {slide.image_url ? (
                <img src={slide.image_url} alt="Foto" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-white mb-1 text-center">
              {adaptedContent || "NOME DO AUTOR"}
            </h2>
            <p className="text-sm text-gray-300 text-center">Uma Autobiografia</p>
          </div>
        );
        
      case 'self_help':
        return (
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-yellow-500 flex flex-col items-center justify-center p-4">
            {slide.image_url && (
              <div className="absolute inset-0 opacity-20">
                <img src={slide.image_url} alt="Fundo" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-sm text-white uppercase mb-2 relative z-10">Como</p>
            <h2 className="text-2xl font-bold text-white mb-3 text-center relative z-10">
              {adaptedContent || "TRANSFORMAR SUA VIDA"}
            </h2>
            <p className="text-sm text-white text-center relative z-10">em apenas 7 passos simples</p>
          </div>
        );
        
      case 'academic':
        return (
          <div className="w-full h-full bg-white flex flex-col">
            <div className="h-12 bg-blue-900 w-full"></div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              {slide.image_url && (
                <div className="w-16 h-16 mb-4">
                  <img src={slide.image_url} alt="Símbolo" className="w-full h-full object-contain" />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                {adaptedContent || "FUNDAMENTOS"}
              </h2>
              <p className="text-sm text-gray-700 text-center">de Ciência Aplicada</p>
            </div>
            <div className="h-6 bg-blue-900 w-full"></div>
          </div>
        );
        
      case 'thriller':
        return (
          <div className="w-full h-full bg-black flex flex-col items-center justify-end p-5">
            {slide.image_url && (
              <div className="absolute inset-0">
                <img 
                  src={slide.image_url} 
                  alt="Fundo Suspense" 
                  className="w-full h-full object-cover opacity-40" 
                  style={{filter: 'contrast(120%) brightness(50%)'}}
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-red-600 mb-2 text-center relative z-10">
              {adaptedContent || "O PERIGO OCULTO"}
            </h2>
            <div className="h-1 w-32 bg-red-600 mb-4 relative z-10"></div>
            <p className="text-sm text-gray-400 text-center relative z-10">AUTOR BESTSELLER</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Função para obter os estilos de bloco de texto para o TextContainer
  const getTextBlockStyles = () => {
    return {
      isBold: textStyles.fontFamily.includes('bold') || layoutType === 'statistics',
      isItalic: layoutType === 'quote' || false,
      alignment: textStyles.alignment as 'left' | 'center' | 'right',
      fontSize: textStyles.fontSize,
      textColor: "#FFFFFF",
      hasBackground: textStyles.hasBackground,
      backgroundColor: textStyles.backgroundColor,
      backgroundOpacity: textStyles.backgroundOpacity
    };
  };

  // Se for um layout de livro, use o renderizador especial
  if (isBookLayout) {
    return renderBookContent();
  }

  // Para layouts regulares e editoriais
  return (
    <>
      {slide.image_url && (
        <img 
          src={slide.image_url}
          alt={`Conteúdo ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover ${
            layoutType === 'long_form' ? 'opacity-30' : 
            layoutType === 'stories' || layoutType === 'tiktok' ? 'object-cover' :
            layoutType === 'twitter' ? 'opacity-90' : ''
          }`}
          style={{
            objectPosition: layoutType === 'facebook' || layoutType === 'youtube' ? 'center 30%' : 'center'
          }}
        />
      )}
      {(adaptedContent && adaptedContent.trim() !== "") && (
        <div className={`relative z-10 w-full h-full ${getTextPositionClass()}`}>
          <div 
            className={`${getTextStyles()} transition-all w-full h-full`}
          >
            {renderTextContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default SlideContent;
