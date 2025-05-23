
import React from "react";

const GalleryLoading: React.FC = () => {
  return (
    <div className="text-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-400">Carregando imagens...</p>
    </div>
  );
};

export default GalleryLoading;
