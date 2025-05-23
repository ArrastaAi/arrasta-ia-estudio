
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw, 
  Maximize2, 
  CheckCheck 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface ImageEditingMenuProps {
  onZoomChange: (value: number) => void;
  onCropStart: () => void;
  onMoveStart: () => void;
  onRotate: () => void;
  onReset: () => void;
  onApply: () => void;
  isOpen: boolean;
  currentZoom: number;
}

const ImageEditingMenu: React.FC<ImageEditingMenuProps> = ({
  onZoomChange,
  onCropStart,
  onMoveStart,
  onRotate,
  onReset,
  onApply,
  isOpen,
  currentZoom = 100
}) => {
  const [zoom, setZoom] = useState<number>(currentZoom);

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    onZoomChange(newZoom / 100);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
    onZoomChange(newZoom / 100);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
    onZoomChange(newZoom / 100);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 border-gray-700 p-4 shadow-lg z-50 w-16 flex flex-col items-center space-y-4">
      <div className="flex flex-col space-y-4">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={onCropStart}>
              <Crop className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Recortar imagem</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={onMoveStart}>
              <Move className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Mover imagem</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={handleZoomIn}>
              <ZoomIn className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Ampliar</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={handleZoomOut}>
              <ZoomOut className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Diminuir</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={onRotate}>
              <RotateCcw className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Rotacionar</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700" onClick={onReset}>
              <Maximize2 className="h-5 w-5 text-gray-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Resetar</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-700 bg-purple-600" onClick={onApply}>
              <CheckCheck className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Aplicar mudanças</p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom percentage indicator */}
        <div className="text-white text-xs text-center mt-2">
          {zoom}%
        </div>
      </div>
    </Card>
  );
};

export default ImageEditingMenu;
