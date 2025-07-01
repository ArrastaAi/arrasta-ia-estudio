
import React, { useState } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Info, Trash2, RotateCcw, Sparkles, Check, Edit3 } from "lucide-react";
import NativeContentGenerator from "./NativeContentGenerator";
import { useToast } from '@/hooks/use-toast';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';

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
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const { toast } = useToast();
  const streamingData = useStreamingGeneration(carouselId);
  
  const MIN_SLIDES = 4;
  const MAX_SLIDES = 12;
  
  const handleApplyTexts = (texts: { id: number; text: string }[]) => {
    if (texts.length < MIN_SLIDES) {
      const completeTexts = [...texts];
      for (let i = texts.length; i < MIN_SLIDES; i++) {
        completeTexts.push({
          id: i + 1,
          text: `Slide ${i + 1} - Conteúdo a ser definido`
        });
      }
      onApplyGeneratedTexts(completeTexts);
    } else if (texts.length > MAX_SLIDES) {
      const limitedTexts = texts.slice(0, MAX_SLIDES);
      onApplyGeneratedTexts(limitedTexts);
    } else {
      onApplyGeneratedTexts(texts);
    }
    
    setShowManualEditor(true);
  };
  
  const handleClearAll = () => {
    streamingData.clearAll();
    setShowManualEditor(false);
    setShowConfirmNew(false);
    toast({
      title: "Conteúdo limpo",
      description: "Todo o conteúdo gerado foi removido."
    });
  };

  const handleGenerateNew = () => {
    if (streamingData.hasContent) {
      setShowConfirmNew(true);
    }
  };

  const confirmGenerateNew = () => {
    streamingData.clearAll();
    setShowConfirmNew(false);
    setShowManualEditor(false);
  };


  return (
    <div className="space-y-6">
      {/* Controles de Gerenciamento */}
      {streamingData.hasContent && (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Conteúdo gerado encontrado</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  {streamingData.slides.length} slides
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleClearAll}
                  className="text-red-400 border-red-400/50 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar Tudo
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateNew}
                  className="text-blue-400 border-blue-400/50 hover:bg-blue-500/10"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gerar Novo
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Modal de Confirmação */}
      {showConfirmNew && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <RotateCcw className="h-4 w-4" />
          <AlertDescription className="text-yellow-300">
            <div className="space-y-3">
              <p>Deseja gerar novo conteúdo? O conteúdo atual será substituído.</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={confirmGenerateNew}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Sim, gerar novo
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowConfirmNew(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <NativeContentGenerator 
        carouselId={carouselId} 
        onApplyTexts={handleApplyTexts}
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
                  className="bg-gray-600 border-gray-500 text-white min-h-[100px]" 
                  placeholder={
                    index === 0 
                      ? "Hook inicial - Chame a atenção do seu público..."
                      : index === slides.length - 1 && slides.length >= MIN_SLIDES
                      ? "Chamada para ação (CTA) - Convide para uma ação..."
                      : `Conteúdo do slide ${index + 1}...`
                  }
                  rows={6}
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
