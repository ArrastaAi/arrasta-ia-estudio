
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAPIKeyManager } from "@/hooks/useAPIKeyManager";
import { useEffect, useState } from "react";

interface GenerateButtonProps {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: GenerateButtonProps) => {
  const { getBestAvailableKey } = useAPIKeyManager();
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = getBestAvailableKey();
      setHasApiKey(!!apiKey && apiKey.length > 0);
    };
    
    checkApiKey();
  }, [getBestAvailableKey]);

  if (!hasApiKey) {
    return (
      <Button 
        disabled
        variant="outline"
        className="bg-yellow-500/20 border-yellow-500 text-yellow-500 hover:bg-yellow-500/30"
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Chave API não configurada
      </Button>
    );
  }

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
