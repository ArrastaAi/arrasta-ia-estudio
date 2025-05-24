
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YuriFormFields, FormatterFields } from "./ai-text-generator/FormFields";
import { CarouselFormFields } from "./ai-text-generator/CarouselFormFields";
import GenerateButton from "./ai-text-generator/GenerateButton";
import GeneratedTexts from "./ai-text-generator/GeneratedTexts";
import AgentInfoDisplay from "./ai-text-generator/AgentInfoDisplay";
import { useFirebaseTextGeneration } from "@/hooks/useFirebaseTextGeneration";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FirebaseAITextGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: { id: number; text: string }[]) => void;
}

const FirebaseAITextGenerator = ({ carouselId, onApplyTexts }: FirebaseAITextGeneratorProps) => {
  const {
    formData,
    loading,
    activeAgent,
    parsedTexts,
    setActiveAgent,
    handleInputChange,
    handleGenerateText,
    handleApply,
    clearGeneratedTexts,
    setFormData
  } = useFirebaseTextGeneration(onApplyTexts);

  const hasGeneratedTexts = parsedTexts.length > 0;
  
  // Número máximo de slides permitido para exibição
  const MAX_SLIDES_ALLOWED = 9;

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
            <CarouselFormFields 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            
            <div className="text-sm text-gray-400 mt-2 italic">
              Este assistente cria carrosséis completos com base no tema, público-alvo e objetivo escolhidos.
            </div>
          </TabsContent>
          
          <TabsContent value="yuri">
            <YuriFormFields 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            
            <div className="text-sm text-gray-400 mt-2 italic">
              Este assistente é especialista em copywriting viral para carrosséis. Informe o tema, público-alvo e objetivo para gerar textos persuasivos.
            </div>
          </TabsContent>
          
          <TabsContent value="formatter">
            <FormatterFields 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            
            <div className="text-sm text-gray-400 mt-2 italic">
              O Criador de Frases transforma qualquer texto em slides prontos para carrossel. Cole seu texto acima para formatá-lo.
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
        
        {hasGeneratedTexts && (
          <Card className="bg-gray-750 border-gray-600 p-4 mt-4">
            <AgentInfoDisplay agent={activeAgent} formData={formData} />
            <GeneratedTexts 
              parsedTexts={parsedTexts.slice(0, MAX_SLIDES_ALLOWED)} 
              handleApply={handleApply} 
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default FirebaseAITextGenerator;
