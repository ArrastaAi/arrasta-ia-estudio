
import React, { useState } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import NativeContentGenerator from "./NativeContentGenerator";
import StreamingSlideEditor from "./StreamingSlideEditor";
import { useToast } from '@/hooks/use-toast';

interface ContentTabProps {
  carouselId: string;
  slides: Slide[];
  onApplyGeneratedTexts: (texts: { id: number; text: string }[]) => void;
  onUpdateSlideContent: (index: number, content: string) => void;
  streamingState?: {
    isStreaming: boolean;
    slides: any[];
    progress: any;
  };
}

const ContentTab: React.FC<ContentTabProps> = ({ 
  carouselId, 
  slides, 
  onApplyGeneratedTexts, 
  onUpdateSlideContent,
  streamingState 
}) => {
  const [showManualEditor, setShowManualEditor] = useState(false);
  
  // Mostrar editor manual quando streaming começar ou já estiver ativo
  const shouldShowEditor = showManualEditor || streamingState?.isStreaming || (streamingState?.slides && streamingState.slides.length > 0);
  const { toast } = useToast();
  
  const MIN_SLIDES = 4;
  const MAX_SLIDES = 12; // Atualizado para 12
  
  const handleApplyTexts = (texts: { id: number; text: string }[]) => {
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
      });
      
      onApplyGeneratedTexts(completeTexts);
    } else if (texts.length > MAX_SLIDES) {
      const limitedTexts = texts.slice(0, MAX_SLIDES);
      
      toast({
        title: "Limite de slides",
        description: `O número máximo de slides foi limitado a ${MAX_SLIDES}.`,
      });
      
      onApplyGeneratedTexts(limitedTexts);
    } else {
      onApplyGeneratedTexts(texts);
    }
    
    setShowManualEditor(true);
  };
  
  return (
    <div className="space-y-6">
      
      <NativeContentGenerator 
        carouselId={carouselId} 
        onApplyTexts={handleApplyTexts}
      />
      
      {shouldShowEditor && (
        <StreamingSlideEditor
          slides={slides}
          streamingSlides={streamingState?.slides || []}
          isStreaming={streamingState?.isStreaming || false}
          progress={streamingState?.progress}
          targetSlideCount={MAX_SLIDES}
          onUpdateSlideContent={onUpdateSlideContent}
          onApplyGeneratedContent={onApplyGeneratedTexts}
        />
      )}
    </div>
  );
};

export default ContentTab;
