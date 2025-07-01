
import React, { useState } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import FirebaseAITextGenerator from "@/components/carousel/FirebaseAITextGenerator";
import { useToast } from '@/hooks/use-toast';

interface ContentTabProps {
  carouselId: string;
  slides: Slide[];
  onApplyGeneratedTexts: (texts: { id: number; text: string }[]) => void;
  onUpdateSlideContent: (index: number, content: string) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ 
  carouselId, 
  slides, 
  onApplyGeneratedTexts, 
  onUpdateSlideContent 
}) => {
  const [showManualEditor, setShowManualEditor] = useState(false);
  const { toast } = useToast();
  
  const MIN_SLIDES = 4;
  const MAX_SLIDES = 9;
  
  const handleApplyCreativeTexts = (texts: { id: number; text: string }[]) => {
    if (texts.length < MIN_SLIDES) {
      const completeTexts = [...texts];
      for (let i = texts.length; i < MIN_SLIDES; i++) {
        completeTexts.push({
          id: i + 1,
          text: `Slide ${i + 1} - Conteúdo a ser definido`
        });
      }
      
      toast({
        title: "Slides completados",
        description: `Adicionados slides vazios para atingir o mínimo de ${MIN_SLIDES} slides.`,
        variant: "default",
      });
      
      onApplyGeneratedTexts(completeTexts);
    } else if (texts.length > MAX_SLIDES) {
      const limitedTexts = texts.slice(0, MAX_SLIDES);
      
      toast({
        title: "Limite de slides",
        description: `O número máximo de slides foi limitado a ${MAX_SLIDES}. Alguns slides gerados foram removidos.`,
        variant: "default",
      });
      
      onApplyGeneratedTexts(limitedTexts);
    } else {
      onApplyGeneratedTexts(texts);
    }
    
    setShowManualEditor(true);
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-blue-300">
          <strong>Regras de conteúdo:</strong> Cada carrossel deve ter entre {MIN_SLIDES} e {MAX_SLIDES} slides.
          Os agentes de IA irão adaptar automaticamente o conteúdo para a quantidade de slides configurada.
        </AlertDescription>
      </Alert>
      
      <FirebaseAITextGenerator 
        carouselId={carouselId} 
        onApplyTexts={handleApplyCreativeTexts}
        slideCount={slides.length || MIN_SLIDES}
      />
      
      {showManualEditor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Edição Manual ({slides.length} slides)
            </h3>
            <div className="text-sm text-gray-400">
              Mín: {MIN_SLIDES} | Máx: {MAX_SLIDES}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {slides && slides.slice(0, MAX_SLIDES).map((slide, index) => (
              <div key={slide.id} className="p-4 bg-gray-700 rounded-lg">
                <Label className="text-white mb-2 block">
                  Slide {index + 1}
                  {index === slides.length - 1 && slides.length >= MIN_SLIDES && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      Último slide
                    </span>
                  )}
                </Label>
                <Textarea 
                  value={slide.content || ""} 
                  onChange={e => onUpdateSlideContent(index, e.target.value)} 
                  className="bg-gray-600 border-gray-500 text-white min-h-[150px]" 
                  placeholder={
                    index === 0 
                      ? "Hook inicial - Chame a atenção do seu público..."
                      : index === slides.length - 1 && slides.length >= MIN_SLIDES
                      ? "Chamada para ação (CTA) - Convide para uma ação..."
                      : `Conteúdo do slide ${index + 1}...`
                  }
                  rows={8}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentTab;
