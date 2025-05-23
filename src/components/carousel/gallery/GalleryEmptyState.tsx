
import React from "react";
import { Image } from "lucide-react";

const GalleryEmptyState: React.FC = () => {
  return (
    <div className="text-center py-10">
      <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <p className="text-gray-400">Nenhuma imagem disponível</p>
      <p className="text-sm text-gray-500 mt-2">Faça upload de imagens para visualizá-las aqui</p>
    </div>
  );
};

export default GalleryEmptyState;
