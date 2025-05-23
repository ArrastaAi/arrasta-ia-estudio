import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Slide } from "@/types/database.types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { TextStyleOptions } from "@/types/carousel.types";
import SlideContent from "./preview/SlideContent";
import CarouselNavigation from "./preview/CarouselNavigation";
import { useLayoutStyles } from "./preview/useLayoutStyles";

interface CarouselPreviewProps {
  slides: Slide[];
  layoutType: string;
  textStyles?: TextStyleOptions;
  hidePreview?: boolean;
  onSlideContentUpdate?: (slideId: string, newContent: string) => void;
}

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ 
  slides, 
  layoutType = "instagram_rect", // Definindo instagram_rect como padrão
  textStyles,
  hidePreview = false,
  onSlideContentUpdate
}) => {
  // Se hidePreview é true, não renderiza nada
  if (hidePreview) {
    return null;
  }

  // Estilos de texto padrão se não fornecidos
  const defaultTextStyles: TextStyleOptions = {
    alignment: "center",
    fontFamily: "helvetica",
    fontSize: 18,
    hasBackground: false,
    backgroundColor: "#000000",
    backgroundOpacity: 50,
    hasOutline: false,
    outlineColor: "#ffffff",
    outlineWidth: 1,
    textPosition: "center"
  };

  // Usa os estilos de texto fornecidos ou os padrões
  const effectiveTextStyles = textStyles || defaultTextStyles;
  
  // Usa o hook de estilos de layout
  const { getAspectRatio, getLayoutDimensions, getGridLayoutClass, getHeaderConfig } = useLayoutStyles(layoutType);
  
  // Verificar se devemos usar um layout de grid
  const gridLayoutClass = getGridLayoutClass();
  const useGridLayout = gridLayoutClass !== "";
  const headerConfig = getHeaderConfig();
  const isEditorialLayout = ['editorial', 'quote', 'manifesto', 'statistics', 'case_study', 'long_form'].includes(layoutType);
  const isBookLayout = ['fiction_cover', 'nonfiction_cover', 'memoir', 'self_help', 'academic', 'thriller'].includes(layoutType);
  
  // Para layouts de grid, mostramos múltiplos slides em uma única visualização
  const visibleSlides = useGridLayout && !isEditorialLayout && !isBookLayout ? 
    (layoutType === "magazine" ? 3 : layoutType === "twitter" ? 4 : 2) : 1;

  // Handler para atualizar o conteúdo de um slide
  const handleSlideContentUpdate = (slideId: string, newContent: string) => {
    if (onSlideContentUpdate) {
      onSlideContentUpdate(slideId, newContent);
    }
  };

  // Handlers para navegação do carrossel
  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevButton = document.querySelector('.carousel-container [data-carousel-prev]') as HTMLButtonElement;
    if (prevButton) prevButton.click();
  };
  
  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextButton = document.querySelector('.carousel-container [data-carousel-next]') as HTMLButtonElement;
    if (nextButton) nextButton.click();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-center items-center mb-4">
          <div className={`rounded-md overflow-hidden ${getLayoutDimensions()}`}>
            {useGridLayout ? (
              // Renderização de layout em grid
              <div className="h-full relative" style={{ backgroundColor: slides[0]?.background_value || "#000000" }}>
                <AspectRatio ratio={getAspectRatio()}>
                  {isEditorialLayout ? (
                    // Layouts editoriais especiais
                    <div className="h-full flex flex-col w-full">
                      {/* Cabeçalho para formatos editoriais */}
                      {headerConfig && (
                        <div 
                          className="w-full py-2 px-3 text-sm font-medium" 
                          style={{ backgroundColor: headerConfig.bgColor, color: headerConfig.textColor }}
                        >
                          {headerConfig.tag}
                        </div>
                      )}
                      
                      {/* Conteúdo principal que varia conforme o tipo de layout editorial */}
                      <div className={`${gridLayoutClass} flex-1`}>
                        {layoutType === 'case_study' && slides[0]?.image_url && (
                          <div className="w-full h-1/2 relative">
                            <img 
                              src={slides[0].image_url} 
                              alt="Imagem principal" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Conteúdo do slide com estilos específicos para cada tipo */}
                        <div className="flex-1 p-4 flex flex-col justify-center">
                          {slides.length > 0 && (
                            <SlideContent
                              slide={slides[0]}
                              index={0}
                              layoutType={layoutType}
                              textStyles={{
                                ...effectiveTextStyles,
                                fontSize: layoutType === 'manifesto' || layoutType === 'statistics' ? 
                                  effectiveTextStyles.fontSize * 1.4 : effectiveTextStyles.fontSize,
                                alignment: layoutType === 'quote' ? 'center' : effectiveTextStyles.alignment
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : isBookLayout ? (
                    // Renderização especial para layouts de livro
                    <div className="h-full w-full">
                      {slides.length > 0 && (
                        <SlideContent
                          slide={slides[0]}
                          index={0}
                          layoutType={layoutType}
                          textStyles={{
                            ...effectiveTextStyles,
                            alignment: 'center'
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    // Grid layouts normais
                    <div className={`${gridLayoutClass} h-full w-full p-1`}>
                      {slides.slice(0, visibleSlides).map((slide, index) => (
                        <div key={slide.id} className="relative h-full bg-gray-800 overflow-hidden">
                          <SlideContent 
                            slide={slide} 
                            index={index} 
                            layoutType={layoutType} 
                            textStyles={effectiveTextStyles} 
                          />
                        </div>
                      ))}
                      
                      {/* Preencher espaços vazios se não houver slides suficientes */}
                      {Array(Math.max(0, visibleSlides - slides.length)).fill(0).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-700 h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Sem conteúdo</span>
                        </div>
                      ))}
                    </div>
                  )}
                </AspectRatio>
              </div>
            ) : (
              // Renderização de carousel padrão para layouts não-grid
              <Carousel className="w-full relative">
                <CarouselContent>
                  {slides.map((slide, index) => (
                    <CarouselItem key={slide.id}>
                      <div className="h-full relative" style={{ backgroundColor: slide.background_value || "#000000" }}>
                        <AspectRatio ratio={getAspectRatio()}>
                          <div className="h-full flex items-center justify-center relative">
                            <SlideContent 
                              slide={slide} 
                              index={index} 
                              layoutType={layoutType} 
                              textStyles={effectiveTextStyles}
                              onContentUpdate={(newContent) => handleSlideContentUpdate(slide.id, newContent)}
                            />
                          </div>
                        </AspectRatio>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <CarouselNavigation onPrevClick={handlePrevClick} onNextClick={handleNextClick} />
                
                {/* Mantém a navegação do carrossel original, mas a esconde visualmente */}
                <div className="carousel-container hidden">
                  <CarouselPrevious data-carousel-prev />
                  <CarouselNext data-carousel-next />
                </div>
              </Carousel>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarouselPreview;
