
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
  layoutType = "instagram_rect",
  textStyles,
  hidePreview = false,
  onSlideContentUpdate
}) => {
  if (hidePreview) {
    return null;
  }

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

  const effectiveTextStyles = textStyles || defaultTextStyles;
  const { getAspectRatio, getLayoutDimensions, getGridLayoutClass, getHeaderConfig } = useLayoutStyles(layoutType);
  
  const gridLayoutClass = getGridLayoutClass();
  const useGridLayout = gridLayoutClass !== "";
  const headerConfig = getHeaderConfig();
  const isEditorialLayout = ['editorial', 'quote', 'manifesto', 'statistics', 'case_study', 'long_form'].includes(layoutType);
  const isBookLayout = ['fiction_cover', 'nonfiction_cover', 'memoir', 'self_help', 'academic', 'thriller'].includes(layoutType);
  
  const visibleSlides = useGridLayout && !isEditorialLayout && !isBookLayout ? 
    (layoutType === "magazine" ? 3 : layoutType === "twitter" ? 4 : 2) : 1;

  const handleSlideContentUpdate = (slideId: string, newContent: string) => {
    if (onSlideContentUpdate) {
      onSlideContentUpdate(slideId, newContent);
    }
  };

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

  // Se não há slides, mostrar preview vazio com fundo preto
  const displaySlides = slides.length > 0 ? slides : [{
    id: 'empty',
    content: '',
    image_url: null,
    background_value: '#000000',
    background_type: 'color',
    order_index: 0
  } as Slide];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-center items-center mb-4">
          <div className={`rounded-md overflow-hidden ${getLayoutDimensions()}`}>
            {useGridLayout ? (
              <div className="h-full relative" style={{ backgroundColor: displaySlides[0]?.background_value || "#000000" }}>
                <AspectRatio ratio={getAspectRatio()}>
                  {isEditorialLayout ? (
                    <div className="h-full flex flex-col w-full">
                      {headerConfig && (
                        <div 
                          className="w-full py-2 px-3 text-sm font-medium" 
                          style={{ backgroundColor: headerConfig.bgColor, color: headerConfig.textColor }}
                        >
                          {headerConfig.tag}
                        </div>
                      )}
                      
                      <div className={`${gridLayoutClass} flex-1`}>
                        {layoutType === 'case_study' && displaySlides[0]?.image_url && (
                          <div className="w-full h-1/2 relative">
                            <img 
                              src={displaySlides[0].image_url} 
                              alt="Imagem principal" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 p-4 flex flex-col justify-center">
                          {displaySlides.length > 0 && (
                            <SlideContent
                              slide={displaySlides[0]}
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
                    <div className="h-full w-full">
                      {displaySlides.length > 0 && (
                        <SlideContent
                          slide={displaySlides[0]}
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
                    <div className={`${gridLayoutClass} h-full w-full p-1`}>
                      {displaySlides.slice(0, visibleSlides).map((slide, index) => (
                        <div key={slide.id} className="relative h-full overflow-hidden" style={{ backgroundColor: slide.background_value || "#000000" }}>
                          <SlideContent 
                            slide={slide} 
                            index={index} 
                            layoutType={layoutType} 
                            textStyles={effectiveTextStyles} 
                          />
                        </div>
                      ))}
                      
                      {Array(Math.max(0, visibleSlides - displaySlides.length)).fill(0).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-black h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Slide vazio</span>
                        </div>
                      ))}
                    </div>
                  )}
                </AspectRatio>
              </div>
            ) : (
              <Carousel className="w-full relative">
                <CarouselContent>
                  {displaySlides.map((slide, index) => (
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
