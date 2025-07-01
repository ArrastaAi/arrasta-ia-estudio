
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface GeneratedText {
  id: number;
  text: string;
}

interface AITextGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: GeneratedText[]) => void;
  slideCount?: number;
}

const AITextGenerator: React.FC<AITextGeneratorProps> = ({
  carouselId,
  onApplyTexts,
  slideCount = 4
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("carousel");
  const [parsedTexts, setParsedTexts] = useState<GeneratedText[]>([]);
  
  const [formData, setFormData] = useState({
    topic: "",
    audience: "",
    goal: "educar",
    content: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateText = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para usar esta funcionalidade",
        variant: "destructive"
      });
      return;
    }

    if (activeAgent === 'carousel' && !formData.topic) {
      toast({
        title: "Erro",
        description: "Por favor, informe o tema do carrossel",
        variant: "destructive"
      });
      return;
    }

    if (activeAgent === 'formatter' && !formData.content) {
      toast({
        title: "Erro",
        description: "Por favor, informe o conteúdo a ser formatado",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "Gerando conteúdo",
        description: `Aguarde while a IA processa seu pedido para ${slideCount} slides...`
      });

      // Chamar Edge Function do Supabase
      const response = await fetch('https://kjoevpxfgujzaekqfzyn.supabase.co/functions/v1/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2V2cHhmZ3VqemFla3FmenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzcxMjcsImV4cCI6MjA2MzMxMzEyN30.L945UdIgiGCowU3ueQNt-Wr8KhdZb6yPNZ4mG9X6L40`
        },
        body: JSON.stringify({
          agent: activeAgent,
          topic: formData.topic,
          audience: formData.audience,
          goal: formData.goal,
          content: formData.content,
          slideCount: slideCount
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na geração: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.parsedTexts && Array.isArray(data.parsedTexts)) {
        const limitedTexts = data.parsedTexts.slice(0, slideCount);
        setParsedTexts(limitedTexts);
        
        toast({
          title: "Sucesso!",
          description: `${limitedTexts.length} slides foram gerados com sucesso.`
        });
      } else {
        throw new Error("Não foi possível processar o texto gerado.");
      }

    } catch (error: any) {
      console.error("Erro ao gerar texto:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o texto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parsedTexts.length === 0) {
      toast({
        title: "Nenhum texto para aplicar",
        description: "Gere textos primeiro antes de aplicar aos slides",
        variant: "destructive"
      });
      return;
    }
    
    onApplyTexts(parsedTexts);
    toast({
      title: "Textos aplicados",
      description: `${parsedTexts.length} textos foram aplicados com sucesso aos slides`
    });
  };

  const clearGeneratedTexts = () => {
    setParsedTexts([]);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeAgent} onValueChange={setActiveAgent}>
        <TabsList className="bg-gray-700">
          <TabsTrigger 
            value="carousel" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Criar Carrossel
          </TabsTrigger>
          <TabsTrigger 
            value="formatter" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Formatar Texto
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="carousel">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic" className="text-white">Tema do Carrossel *</Label>
                <Input
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="Ex: Dicas de marketing digital"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="audience" className="text-white">Público-alvo</Label>
                <Input
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  placeholder="Ex: Empreendedores iniciantes"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="formatter">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content" className="text-white">Conteúdo para Formatar *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Cole aqui o texto que você quer transformar em slides..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex flex-col space-y-4">
        <Button 
          onClick={handleGenerateText}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Conteúdo
            </>
          )}
        </Button>
        
        {parsedTexts.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {parsedTexts.length} slides gerados
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearGeneratedTexts}
                className="text-gray-400 hover:text-white text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Limpar
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedTexts.map((text, index) => (
                <Card key={text.id} className="bg-gray-750 border-gray-600 p-3">
                  <div className="text-xs text-gray-400 mb-1">Slide {index + 1}</div>
                  <div className="text-sm text-white">{text.text}</div>
                </Card>
              ))}
            </div>
            
            <Button 
              onClick={handleApply}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Aplicar aos Slides
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AITextGenerator;
