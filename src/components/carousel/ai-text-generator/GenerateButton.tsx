import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Settings } from "lucide-react";
import { useAPIKeyManager } from "@/hooks/useAPIKeyManager";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface GenerateButtonProps {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: GenerateButtonProps) => {
  const { getBestAvailableKey } = useAPIKeyManager();
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Verificar se há uma chave de API disponível
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
        asChild
        className="bg-gradient-to-r from-amber-500 to-orange-500"
      >
        <Link to="/settings">
          <Settings className="mr-2 h-4 w-4" />
          Configurar Chave API
        </Link>
      </Button>
    );
  }

  return (
    <Button 
      onClick={onClick}
      disabled={loading}
      className="bg-gradient-to-r from-purple-500 to-blue-500"
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
