
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAPIKeyManager } from "@/hooks/useFirebaseAPIKeyManager";
import { generateAgentContent } from "@/firebase/functions/generateAgentContent";

interface GeneratedText {
  id: number;
  text: string;
}

interface FirebaseStructuredContentGeneratorProps {
  onApplyTexts: (texts: GeneratedText[]) => void;
}

const FirebaseStructuredContentGenerator: React.FC<FirebaseStructuredContentGeneratorProps> = ({
  onApplyTexts
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);
  const [formData, setFormData] = useState({
    topic: "",
    audience: "",
    goal: "educar",
    slideCount: 5,
    style: "profissional"
  });

  const { toast } = useToast();
  const { getBestAvailableKey, incrementKeyUsage } = useFirebaseAPIKeyManager();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.topic.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "Por favor, informe o tópico do carrossel",
          variant: "destructive"
        });
        return;
      }

      // Get API key
      const apiKey = getBestAvailableKey();
      if (!apiKey) {
        toast({
          title: "Chave API necessária",
          description: "Configure uma chave do Google Gemini nas configurações",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Gerando conteúdo",
        description: "Aguarde enquanto criamos seu carrossel..."
      });

      // Call generation function
      const result = await generateAgentContent({
        agent: "yuri",
        topic: formData.topic,
        audience: formData.audience,
        goal: formData.goal,
        apiKey,
        slideCount: formData.slideCount,
        format: {
          slideCounts: formData.slideCount,
          wordLimits: Array(formData.slideCount).fill(25)
        },
        maxSlidesAllowed: 9
      });

      if (result.success && result.parsedTexts) {
        // Increment API usage
        await incrementKeyUsage(apiKey);
        
        setGeneratedTexts(result.parsedTexts);
        toast({
          title: "Conteúdo gerado!",
          description: `${result.parsedTexts.length} slides criados com sucesso`
        });
      } else {
        throw new Error(result.error || "Erro ao gerar conteúdo");
      }

    } catch (error: any) {
      console.error("Erro na geração:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o conteúdo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedTexts.length === 0) {
      toast({
        title: "Nenhum conteúdo",
        description: "Gere conteúdo primeiro antes de aplicar",
        variant: "destructive"
      });
      return;
    }

    onApplyTexts(generatedTexts);
    toast({
      title: "Conteúdo aplicado",
      description: "Os textos foram aplicados aos slides"
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="topic">Tópico do Carrossel *</Label>
          <Input
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="Ex: Como aumentar vendas online"
            className="bg-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="audience">Público-alvo</Label>
          <Input
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleInputChange}
            placeholder="Ex: Empreendedores digitais"
            className="bg-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="goal">Objetivo</Label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option value="educar">Educar</option>
            <option value="vender">Vender</option>
            <option value="engajar">Engajar</option>
            <option value="inspirar">Inspirar</option>
          </select>
        </div>

        <div>
          <Label htmlFor="slideCount">Número de Slides</Label>
          <Input
            id="slideCount"
            name="slideCount"
            type="number"
            min="3"
            max="9"
            value={formData.slideCount}
            onChange={handleInputChange}
            className="bg-gray-700 text-white"
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando conteúdo...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Gerar Carrossel
          </>
        )}
      </Button>

      {generatedTexts.length > 0 && (
        <Card className="p-4 bg-gray-700 border-gray-600">
          <h3 className="text-lg font-medium text-white mb-3">Conteúdo Gerado</h3>
          
          <div className="space-y-2 mb-4">
            {generatedTexts.map((text, index) => (
              <div key={index} className="p-3 bg-gray-600 rounded-lg">
                <div className="text-sm text-gray-300 mb-1">Slide {text.id}</div>
                <div className="text-white">{text.text}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleApply}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Type className="mr-2 h-4 w-4" />
            Aplicar aos Slides
          </Button>
        </Card>
      )}
    </div>
  );
};

export default FirebaseStructuredContentGenerator;
