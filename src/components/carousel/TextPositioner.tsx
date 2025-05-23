
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Move } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TextPositionerProps {
  onPositionChange: (position: { x: number, y: number }) => void;
  initialPosition?: { x: number, y: number };
}

const TextPositioner: React.FC<TextPositionerProps> = ({ 
  onPositionChange, 
  initialPosition = { x: 50, y: 50 } 
}) => {
  const [position, setPosition] = useState(initialPosition);
  const { toast } = useToast();

  const positions = [
    { name: "Top Left", x: 25, y: 25 },
    { name: "Top Center", x: 50, y: 25 },
    { name: "Top Right", x: 75, y: 25 },
    { name: "Middle Left", x: 25, y: 50 },
    { name: "Middle Center", x: 50, y: 50 },
    { name: "Middle Right", x: 75, y: 50 },
    { name: "Bottom Left", x: 25, y: 75 },
    { name: "Bottom Center", x: 50, y: 75 },
    { name: "Bottom Right", x: 75, y: 75 },
  ];

  const handlePositionClick = (x: number, y: number, name: string) => {
    setPosition({ x, y });
    onPositionChange({ x, y });
    
    toast({
      title: "Posição do texto alterada",
      description: `Texto posicionado: ${name}`
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white">Posicionar texto</h4>
      
      <div className="grid grid-cols-3 gap-2 bg-gray-700 rounded-md p-2">
        {positions.map((pos) => (
          <Button
            key={`${pos.x}-${pos.y}`}
            variant="ghost"
            size="sm"
            className={`h-10 flex items-center justify-center ${
              position.x === pos.x && position.y === pos.y
                ? "bg-gray-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
            onClick={() => handlePositionClick(pos.x, pos.y, pos.name)}
          >
            <Move className="h-4 w-4" />
          </Button>
        ))}
      </div>
      
      <div className="relative bg-gray-600 border border-gray-500 rounded-md h-36 overflow-hidden">
        <div 
          className="absolute bg-white/20 rounded-md p-2 w-16 h-8 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-move"
          style={{ 
            left: `${position.x}%`, 
            top: `${position.y}%` 
          }}
        >
          <span className="text-xs text-white">Texto</span>
        </div>
      </div>
    </div>
  );
};

export default TextPositioner;
