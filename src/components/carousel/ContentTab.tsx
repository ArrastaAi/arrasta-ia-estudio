import React, { useState, useEffect } from 'react';
import { Slide } from "@/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AITextGenerator from "@/components/carousel/AITextGenerator";
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import APIKeyManagementPanel from "@/components/settings/APIKeyManagementPanel";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

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
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const isAdmin = user?.email === "admin@example.com"; // Replace with your admin check logic
  
  const handleApplyCreativeTexts = (texts: { id: number; text: string }[]) => {
    // Limitar o número de slides para 9
    const limitedTexts = texts.length > 9 ? texts.slice(0, 9) : texts;
    
    if (limitedTexts.length < texts.length) {
      toast({
        title: "Limite de slides",
        description: `O número máximo de slides foi limitado a 9. Alguns slides gerados foram removidos.`,
        variant: "info",
        autoShow: true
      });
    }
    
    onApplyGeneratedTexts(limitedTexts);
    setShowManualEditor(true);
  };

  // Abrir painel de configuração de chaves API
  const openApiKeySettings = () => {
    setShowApiKeySettings(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-white">Geração de Conteúdo</h3>
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openApiKeySettings} 
            className="flex items-center gap-1"
          >
            <Settings2 className="h-4 w-4" /> 
            <span className="hidden sm:inline">Gerenciar API Keys</span>
            <span className="inline sm:hidden">API Keys</span>
          </Button>
        )}
      </div>
      
      <AITextGenerator carouselId={carouselId} onApplyTexts={handleApplyCreativeTexts} />
      
      {showManualEditor && (
        <>
          <div className="space-y-4 mt-2">
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
        </>
      )}

      {/* Modal de configuração de chaves API */}
      <Dialog open={showApiKeySettings} onOpenChange={setShowApiKeySettings}>
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Gerenciamento de Chaves de API</DialogTitle>
          </DialogHeader>
          
          <APIKeyManagementPanel className="mt-4" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentTab;
