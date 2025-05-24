
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YuriFormFields, FormatterFields } from "./ai-text-generator/FormFields";
import { CarouselFormFields } from "./ai-text-generator/CarouselFormFields";
import GenerateButton from "./ai-text-generator/GenerateButton";
import GeneratedTexts from "./ai-text-generator/GeneratedTexts";
import AgentInfoDisplay from "./ai-text-generator/AgentInfoDisplay";
import { useFirebaseTextGeneration } from "@/hooks/useFirebaseTextGeneration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FirebaseAITextGeneratorProps {
  carouselId: string;
  onApplyTexts: (texts: { id: number; text: string }[]) => void;
  slideCount?: number; // Nova prop para quantidade de slides
}

const FirebaseAITextGenerator = ({ 
  carouselId, 
  onApplyTexts,
  slideCount = 4 // Padrão mínimo de 4 slides
}: FirebaseAITextGeneratorProps) => {
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
  } = useFirebaseTextGeneration(onApplyTexts, slideCount); // Passar slideCount para o hook

  const hasGeneratedTexts = parsedTexts.length > 0;
  
  // Número máximo de slides permitido para exibição
  const MAX_SLIDES_ALLOWED = 9;
  const MIN_SLIDES_ALLOWED = 4;

  // Garantir que slideCount está dentro dos limites
  const validSlideCount = Math.max(MIN_SLIDES_ALLOWED, Math.min(slideCount, MAX_SLIDES_ALLOWED));

  return (
    <div className="space-y-4">
      <Alert className="bg-purple-500/10 border-purple-500/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-purple-300">
          <strong>Geração adaptativa:</strong> Os agentes irão gerar conteúdo para <Badge variant="secondary" className="mx-1">{validSlideCount} slides</Badge>.
          Cada agente adaptará seu estilo e estrutura para essa quantidade.
        </AlertDescription>
      </Alert>

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
              Este assistente cria carrosséis completos com {validSlideCount} slides baseados no tema, público-alvo e objetivo escolhidos.
            </div>
          </TabsContent>
          
          <TabsContent value="yuri">
            <YuriFormFields 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            
            <div className="text-sm text-gray-400 mt-2 italic">
              Este assistente é especialista em copywriting viral. Irá gerar {validSlideCount} textos persuasivos adaptados ao tema, público-alvo e objetivo.
            </div>
          </TabsContent>
          
          <TabsContent value="formatter">
            <FormatterFields 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            
            <div className="text-sm text-gray-400 mt-2 italic">
              O Criador de Frases transformará seu texto em {validSlideCount} slides formatados e prontos para carrossel.
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex flex-col space-y-4">
        <GenerateButton 
          loading={loading} 
          onClick={handleGenerateText}
          slideCount={validSlideCount}
        />
        
        {parsedTexts.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {parsedTexts.length} de {validSlideCount} slides gerados
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
            <AgentInfoDisplay agent={activeAgent} formData={formData} slideCount={validSlideCount} />
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
