
import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadAreaProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxImages: number;
  disabled: boolean;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ 
  onFileSelect, 
  maxImages, 
  disabled 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-600 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
      <Upload className="h-10 w-10 text-gray-400 mb-2" />
      <p className="text-sm text-gray-400 mb-4">
        Arraste até {maxImages} imagens ou clique para selecionar
      </p>
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="image-upload"
        ref={fileInputRef}
        onChange={onFileSelect}
        disabled={disabled}
      />
      <Button 
        variant="outline" 
        className="cursor-pointer" 
        disabled={disabled}
        type="button"
        onClick={handleSelectClick}
      >
        Selecionar imagens
      </Button>
    </div>
  );
};

export default ImageUploadArea;
