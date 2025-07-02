
import React from 'react';
import { Slide } from "@/types/database.types";
import NativeContentGenerator from "./NativeContentGenerator";

interface ContentTabProps {
  carouselId: string;
  slides: Slide[];
  onApplyGeneratedTexts: (texts: { id: number; text: string }[]) => void;
  onUpdateSlideContent: (index: number, content: string) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ 
  carouselId, 
  onApplyGeneratedTexts
}) => {
  const handleApplyTexts = (texts: { id: number; text: string }[]) => {
    onApplyGeneratedTexts(texts);
  };
  
  return (
    <div className="space-y-6">
      <NativeContentGenerator 
        carouselId={carouselId} 
        onApplyTexts={handleApplyTexts}
      />
    </div>
  );
};

export default ContentTab;
