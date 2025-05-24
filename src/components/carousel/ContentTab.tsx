
import React, { useState } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FirebaseAITextGenerator from "@/components/carousel/FirebaseAITextGenerator";
import UserCarouselsPreview from "@/components/carousel/UserCarouselsPreview";
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
  
  const handleApplyCreativeTexts = (texts: { id: number; text: string }[]) => {
    // Limitar o número de slides para 9
    const limitedTexts = texts.length > 9 ? texts.slice(0, 9) : texts;
    
    if (limitedTexts.length < texts.length) {
      toast({
        title: "Limite de slides",
        description: `O número máximo de slides foi limitado a 9. Alguns slides gerados foram removidos.`,
        variant: "default",
      });
    }
    
    onApplyGeneratedTexts(limitedTexts);
    setShowManualEditor(true);
  };
  
  return (
    <div className="space-y-6">
      <UserCarouselsPreview />
      
      <FirebaseAITextGenerator carouselId={carouselId} onApplyTexts={handleApplyCreativeTexts} />
      
      {showManualEditor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Edição Manual</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {slides && slides.slice(0, 9).map((slide, index) => (
              <div key={slide.id} className="p-4 bg-gray-700 rounded-lg">
                <Label className="text-white mb-2 block">Slide {index + 1}</Label>
                <Textarea 
                  value={slide.content || ""} 
                  onChange={e => onUpdateSlideContent(index, e.target.value)} 
                  className="bg-gray-600 border-gray-500 text-white min-h-[150px]" 
                  placeholder={`Conteúdo do slide ${index + 1}...`} 
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
