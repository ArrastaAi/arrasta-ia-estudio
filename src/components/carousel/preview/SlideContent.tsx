import React, { useEffect, useState } from 'react';
import { Slide } from "@/types/database.types";
import { TextStyleOptions } from "@/types/carousel.types";
import { 
  ImageInfo, 
  adaptContentToModel, 
  analyzeImageBrightness, 
  detectImageAspectRatio, 
  determineOptimalTextPosition, 
  determineFontFamily 
} from "@/utils/layoutStyleUtils";
import IntelligentTextRenderer from '../text/IntelligentTextRenderer';

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
        
        // Adapta o conteúdo para o modelo específico
        const newContent = adaptContentToModel(slide.content, layoutType);
        setAdaptedContent(newContent);
      } else {
        setImageInfo({
          url: null,
          aspectRatio: null,
          hasDarkAreas: true,
          hasBrightAreas: false
        });
        setAdaptedContent(slide.content || "");
      }
    };
    
    analyzeImage();
  }, [slide.image_url, layoutType, slide.content, index]);
  
  // Verificar se é um layout de livro
  const isBookLayout = ['fiction_cover', 'nonfiction_cover', 'memoir', 'self_help', 'academic', 'thriller'].includes(layoutType);
  
  // Handle text update
  const handleTextUpdate = (newText: string) => {
    if (onContentUpdate) {
      onContentUpdate(newText);
    }
  };

  // Se for um layout de livro, use o renderizador original
  if (isBookLayout) {
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
    return renderBookContent();
  }

  // Para layouts regulares, usar o sistema inteligente da Predial Casa Nova
  return (
    <>
      {slide.image_url && (
        <img 
          src={slide.image_url}
          alt={`Conteúdo ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {(adaptedContent && adaptedContent.trim() !== "") && (
        <div className="relative z-10 w-full h-full">
          <IntelligentTextRenderer
            text={adaptedContent}
            textStyles={textStyles}
            imageAnalysis={{
              hasDarkAreas: imageInfo.hasDarkAreas,
              hasBrightAreas: imageInfo.hasBrightAreas,
              aspectRatio: imageInfo.aspectRatio
            }}
            onTextChange={handleTextUpdate}
          />
        </div>
      )}
    </>
  );
};

export default SlideContent;
