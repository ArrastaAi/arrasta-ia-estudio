
import React from 'react';
import { Slide } from "@/types/database.types";
import NativeContentGenerator from "./NativeContentGenerator";

interface ContentTabProps {
  carouselId: string;
  slides: Slide[];
  onApplyGeneratedTexts: (texts: { id: number; text: string }[]) => void;
  onUpdateSlideContent: (index: number, content: string) => void;
  onNavigateToDesign?: () => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ 
  carouselId, 
  onApplyGeneratedTexts,
  onNavigateToDesign
}) => {
  const handleApplyTexts = (texts: { id: number; text: string }[]) => {
    onApplyGeneratedTexts(texts);
  };
  
  return (
    <div className="space-y-6">
      <NativeContentGenerator 
        carouselId={carouselId} 
        onApplyTexts={handleApplyTexts}
        onNavigateToDesign={onNavigateToDesign}
      />
    </div>
  );
};

export default ContentTab;
