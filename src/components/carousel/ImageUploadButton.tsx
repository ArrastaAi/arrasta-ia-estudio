
import React from "react";
import { Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadButtonProps {
  onUpload: () => void;
  uploading: boolean;
  imageCount: number;
  mlAnalysisEnabled?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ 
  onUpload, 
  uploading, 
  imageCount,
  mlAnalysisEnabled = false
}) => {
  return (
    <div className="flex justify-end mt-4">
      <Button 
        onClick={onUpload} 
        disabled={uploading} 
        className="bg-gradient-to-r from-purple-500 to-blue-500"
      >
        {uploading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            {mlAnalysisEnabled ? "Carregando e analisando..." : "Carregando..."}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {mlAnalysisEnabled && <Sparkles className="h-4 w-4 mr-1" />}
            Carregar {imageCount} {imageCount === 1 ? 'imagem' : 'imagens'}
            {mlAnalysisEnabled && " com IA"}
          </>
        )}
      </Button>
    </div>
  );
};

export default ImageUploadButton;
