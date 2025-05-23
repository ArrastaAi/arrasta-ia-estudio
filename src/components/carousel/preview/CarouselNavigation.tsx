
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CarouselNavigationProps {
  onPrevClick: (e: React.MouseEvent) => void;
  onNextClick: (e: React.MouseEvent) => void;
}

const CarouselNavigation: React.FC<CarouselNavigationProps> = ({ onPrevClick, onNextClick }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-2">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-gray-800/70 border-gray-600 pointer-events-auto hover:bg-gray-700/90 hover:border-gray-500"
        onClick={onPrevClick}
      >
        <ArrowLeft className="h-4 w-4 text-white" />
        <span className="sr-only">Slide anterior</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-gray-800/70 border-gray-600 pointer-events-auto hover:bg-gray-700/90 hover:border-gray-500"
        onClick={onNextClick}
      >
        <ArrowRight className="h-4 w-4 text-white" />
        <span className="sr-only">Próximo slide</span>
      </Button>
    </div>
  );
};

export default CarouselNavigation;
