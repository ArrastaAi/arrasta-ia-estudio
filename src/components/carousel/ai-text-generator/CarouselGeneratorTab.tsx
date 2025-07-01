import React from 'react';
import { CarouselFormFields } from "./CarouselFormFields";
import { useCarouselGeneration } from "@/hooks/useCarouselGeneration";

interface CarouselGeneratorTabProps {
  // Add any props here
}

const CarouselGeneratorTab: React.FC<CarouselGeneratorTabProps> = () => {
  const {
    generateCarouselContent,
    loading
  } = useCarouselGeneration();
  
  // Mock formData for compatibility
  const formData = { prompt: '', topic: '', audience: '', goal: '', content: '' };
  const handleInputChange = () => {};
  const setFormData = () => {};

  return (
    <div className="space-y-4">
      <CarouselFormFields 
        formData={formData} 
        handleInputChange={handleInputChange}
        setFormData={setFormData}
      />
      <div className="text-sm text-gray-400 mt-2 italic">
        Este assistente é especialista em copywriting viral para carrosséis. Informe o tema, público-alvo e objetivo para gerar textos persuasivos.
      </div>
    </div>
  );
};

export default CarouselGeneratorTab;
