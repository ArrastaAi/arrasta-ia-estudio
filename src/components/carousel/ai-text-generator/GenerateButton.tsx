
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: GenerateButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      disabled={loading}
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar com IA
        </>
      )}
    </Button>
  );
};

export default GenerateButton;
