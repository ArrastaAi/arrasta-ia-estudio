import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YuriFormFields, FormatterFields } from "./ai-text-generator/FormFields";
import GenerateButton from "./ai-text-generator/GenerateButton";
import GeneratedTexts from "./ai-text-generator/GeneratedTexts";
import { useTextGeneration } from "@/hooks/useTextGeneration";
import { useToast } from "@/hooks/use-toast";
import CarouselGeneratorTab from "./ai-text-generator/CarouselGeneratorTab";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AITextGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: { id: number; text: string }[]) => void;
}

const AITextGenerator = ({ carouselId, onApplyTexts }: AITextGeneratorProps) => {
  const {
    formData,
    loading,
    activeAgent,
    parsedTexts,
    setActiveAgent,
    handleInputChange,
    handleGenerateText: originalHandleGenerateText,
    handleApply,
    clearGeneratedTexts,
    setFormData
  } = useTextGeneration(onApplyTexts);
  const { toast } = useToast();

 const handleGenerateText = async () => {
    if (activeAgent === 'yuri' && !formData.topic) {
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
    
    // Use the original handleGenerateText to get the initial text
    await originalHandleGenerateText();

    // Get the generated text from the form data
    const generatedText = formData.topic || formData.content || "";

    // Create the final prompt by combining the structure prompt and the generated text
    const finalPrompt = CAROUSEL_STRUCTURE_PROMPT.replace("[Insira aqui seu conteúdo bruto]", generatedText);

    // Update the form data with the final prompt
    setFormData(prevFormData => ({
      ...prevFormData,
      topic: activeAgent === "yuri" ? finalPrompt : prevFormData.topic,
      content: activeAgent === "formatter" ? finalPrompt : prevFormData.content,
    }));

    // Call the original handleGenerateText again to generate the structured content
    await originalHandleGenerateText();
  };

  const hasGeneratedTexts = parsedTexts.length > 0;
  
  // Número máximo de slides permitido para exibição
  const MAX_SLIDES_ALLOWED = 9;

const CAROUSEL_STRUCTURE_PROMPT = `
Transforme o conteúdo abaixo em um carrossel otimizado com exatamente 13 blocos de
texto.
Siga a estrutura de contagem de palavras exata abaixo.
Não adicione emojis, comentários ou menções a slides.
Cada bloco deve iniciar com 'texto X -'.
Ajuste os textos conforme necessário para que o número de palavras de cada bloco fique o
mais próximo possível do estipulado, sem alterar o sentido original.
📌 **Conteúdo:**
[Insira aqui seu conteúdo bruto]
🎯 **Contagem de palavras obrigatória por bloco**:
- texto 1 - 6 palavras
- texto 2 - 11 palavras
- texto 3 - 22 palavras
- texto 4 - 19 palavras
- texto 5 - 68 palavras
- texto 6 - 11 palavras
- texto 7 - 36 palavras
- texto 8 - 49 palavras
- texto 9 - 15 palavras
- texto 10 - 41 palavras
- texto 11 - 18 palavras
- texto 12 - 54 palavras
- texto 13 - 21 palavras
`;

  return (
    <div className="space-y-4">
      
      <Tabs defaultValue={activeAgent}>
        <TabsList className="bg-gray-700">
          <TabsTrigger 
            value="carousel" 
            onClick={() => setActiveAgent("carousel")}
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Criar Carrossel
          </TabsTrigger>
          <TabsTrigger 
            value="yuri" 
            onClick={() => setActiveAgent("yuri")}
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Criar Textos
          </TabsTrigger>
           <TabsTrigger 
            value="formatter" 
            onClick={() => setActiveAgent("formatter")}
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Criar Frases
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="carousel">
            <CarouselGeneratorTab/>
          </TabsContent>
          <TabsContent value="yuri">
            <YuriFormFields
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            <div className="text-sm text-gray-400 mt-2 italic">
              Este assistente é especialista em copywriting viral para textos.
              Informe o tema, público-alvo e objetivo para gerar textos persuasivos.
            </div>
          </TabsContent>
          <TabsContent value="formatter">
            <FormatterFields
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            <div className="text-sm text-gray-400 mt-2 italic">
              O Criador de Frases transforma qualquer texto em slides prontos para
              carrossel. Cole seu texto acima para formatá-lo.
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex flex-col space-y-4">
        <GenerateButton 
          loading={loading} 
          onClick={handleGenerateText} 
        />
        
        {parsedTexts.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Máximo de {MAX_SLIDES_ALLOWED} slides permitido
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearGeneratedTexts}
              className="text-gray-400 hover:text-white text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Limpar textos
            </Button>
          </div>
        )}
        
        {parsedTexts.map((text, index) => (
          <Card key={text.id} className="bg-gray-750 border-gray-600 p-4 mt-4">
            <div className="text-sm text-gray-400">Slide {index + 1}</div>
            <div className="text-white">{text.text}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AITextGenerator;
