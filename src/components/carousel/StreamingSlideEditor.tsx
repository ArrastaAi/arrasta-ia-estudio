import React, { useEffect } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Check } from "lucide-react";

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

interface StreamingSlideEditorProps {
  slides: Slide[];
  streamingSlides: SlideContent[];
  isStreaming: boolean;
  progress: any;
  targetSlideCount: number;
  onUpdateSlideContent: (index: number, content: string) => void;
  onApplyGeneratedContent: (texts: { id: number; text: string }[]) => void;
}

const StreamingSlideEditor: React.FC<StreamingSlideEditorProps> = ({
  slides,
  streamingSlides,
  isStreaming,
  progress,
  targetSlideCount,
  onUpdateSlideContent,
  onApplyGeneratedContent
}) => {
  // Aplicar conteúdo automaticamente quando novos slides streaming chegam
  useEffect(() => {
    if (streamingSlides.length > 0) {
      const convertedTexts = streamingSlides.map((slide, index) => ({
        id: index + 1,
        text: `${slide.title}\n\n${slide.subtitle}\n\n${slide.body.join('\n')}`
      }));
      onApplyGeneratedContent(convertedTexts);
    }
  }, [streamingSlides, onApplyGeneratedContent]);

  const getSlideStatus = (index: number) => {
    if (streamingSlides.length > index) return 'completed';
    if (isStreaming && progress) {
      // Se estamos gerando e o índice está próximo do progresso atual
      const expectedSlides = Math.floor((progress.progress / 100) * targetSlideCount);
      if (index < expectedSlides) return 'generating';
    }
    return 'pending';
  };

  const renderSlideContent = (slide: Slide, index: number) => {
    const status = getSlideStatus(index);
    
    if (status === 'pending' && isStreaming) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 bg-gray-600" />
          <Skeleton className="h-4 w-1/2 bg-gray-600" />
          <Skeleton className="h-20 w-full bg-gray-600" />
        </div>
      );
    }

    if (status === 'generating') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="text-xs text-blue-400">Gerando conteúdo...</span>
          </div>
          <Skeleton className="h-4 w-3/4 bg-gray-600 animate-pulse" />
          <Skeleton className="h-4 w-1/2 bg-gray-600 animate-pulse" />
          <Skeleton className="h-20 w-full bg-gray-600 animate-pulse" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {status === 'completed' && streamingSlides.length > index && (
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-400 animate-scale-in" />
            <span className="text-xs text-green-400">Conteúdo gerado</span>
          </div>
        )}
        <Textarea 
          value={slide.content || ""} 
          onChange={e => onUpdateSlideContent(index, e.target.value)} 
          className="bg-gray-600 border-gray-500 text-white min-h-[100px]" 
          placeholder={
            index === 0 
              ? "Hook inicial - Chame a atenção do seu público..."
              : index === slides.length - 1 && slides.length >= 4
              ? "Chamada para ação (CTA) - Convide para uma ação..."
              : `Conteúdo do slide ${index + 1}...`
          }
          rows={6}
        />
      </div>
    );
  };

  // Mostrar slides existentes + placeholders para os que estão sendo gerados
  const totalSlidesToShow = Math.max(slides.length, targetSlideCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          Edição Manual ({slides.length}/{targetSlideCount} slides)
          {isStreaming && (
            <span className="ml-2 text-sm text-blue-400 animate-pulse">
              • Gerando conteúdo...
            </span>
          )}
        </h3>
        <div className="text-sm text-gray-400">
          Mín: 4 | Máx: 12
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {Array.from({ length: totalSlidesToShow }, (_, index) => {
          const slide = slides[index];
          const status = getSlideStatus(index);
          
          // Se não existe slide ainda, renderizar placeholder
          if (!slide) {
            return (
              <div 
                key={`placeholder-${index}`}
                className="p-4 rounded-lg transition-all duration-300 bg-gray-700/50 border-l-4 border-gray-600"
              >
                <Label className="text-white mb-2 block flex items-center gap-2">
                  Slide {index + 1}
                  {status === 'generating' && (
                    <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                  )}
                </Label>
                <div className="space-y-2">
                  {status === 'generating' ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-400">Gerando conteúdo...</span>
                      </div>
                      <Skeleton className="h-4 w-3/4 bg-gray-600 animate-pulse" />
                      <Skeleton className="h-4 w-1/2 bg-gray-600 animate-pulse" />
                      <Skeleton className="h-20 w-full bg-gray-600 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-4 w-3/4 bg-gray-600" />
                      <Skeleton className="h-4 w-1/2 bg-gray-600" />
                      <Skeleton className="h-20 w-full bg-gray-600" />
                    </>
                  )}
                </div>
              </div>
            );
          }
          
          return (
            <div 
              key={slide.id} 
              className={`p-4 rounded-lg transition-all duration-300 ${
                status === 'completed' 
                  ? 'bg-gray-700 border-l-4 border-green-500' 
                  : status === 'generating'
                  ? 'bg-gray-700 border-l-4 border-blue-500 animate-pulse'
                  : 'bg-gray-700/50 border-l-4 border-gray-600'
              }`}
            >
              <Label className="text-white mb-2 block flex items-center gap-2">
                Slide {index + 1}
                {status === 'completed' && (
                  <Check className="h-3 w-3 text-green-400" />
                )}
                {status === 'generating' && (
                  <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                )}
                {index === slides.length - 1 && slides.length >= 4 && (
                  <span className="ml-auto text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    Último slide
                  </span>
                )}
              </Label>
              {renderSlideContent(slide, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingSlideEditor;