
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedText {
  id: number;
  text: string;
}

interface GeneratedTextsProps {
  parsedTexts: GeneratedText[];
  handleApply: () => void;
}

const GeneratedTexts = ({ parsedTexts, handleApply }: GeneratedTextsProps) => {
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const { toast } = useToast();
  
  if (parsedTexts.length === 0) {
    return null;
  }
  
  const handleApplyTexts = () => {
    handleApply();
    toast({
      title: "Textos aplicados aos slides",
      description: "Seus textos foram aplicados e otimizados para o layout atual."
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium text-white flex items-center gap-2">
          Textos Gerados
          <span className="text-sm text-gray-400">({parsedTexts.length} slides)</span>
        </h4>
      </div>
      
      <div className="space-y-3">
        {parsedTexts.map((text) => (
          <Card 
            key={text.id} 
            className={`border-l-4 transition-all duration-200 ${
              selectedTextId === text.id 
                ? "bg-gray-700 border-purple-500 border-gray-600" 
                : "bg-gray-800 border-gray-700 hover:border-purple-400"
            }`}
            onClick={() => setSelectedTextId(text.id)}
          >
            <div className="p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-purple-400">
                  Slide {text.id}
                </span>
              </div>
              <p className="text-sm text-white font-medium">
                {text.text}
              </p>
            </div>
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={handleApplyTexts} 
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 font-medium mt-4"
      >
        <Check className="mr-2 h-4 w-4" /> Aplicar aos Slides
      </Button>
    </div>
  );
};

export default GeneratedTexts;
