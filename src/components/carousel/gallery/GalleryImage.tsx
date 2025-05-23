
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImageProps {
  url: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  url,
  name,
  isSelected,
  onSelect,
  onDelete
}) => {
  return (
    <div 
      className={`relative group cursor-pointer border-2 ${isSelected ? 'border-purple-500' : 'border-transparent'} rounded-md overflow-hidden`}
      onClick={onSelect}
    >
      <img 
        src={url} 
        alt={name} 
        className="w-full h-24 object-cover" 
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button 
          variant="destructive" 
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GalleryImage;
