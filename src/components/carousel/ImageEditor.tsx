
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageEditingMenu from './ImageEditingMenu';
import { Button } from '@/components/ui/button';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { toast } = useToast();

  useEffect(() => {
    // Load the image
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS if needed
    img.onload = () => {
      imageRef.current = img;
      initCanvas();
    };
    img.src = imageUrl;

    return () => {
      if (imageRef.current) {
        imageRef.current = null;
      }
    };
  }, [imageUrl]);

  const initCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // Initialize crop area to the full image
    setCropArea({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    
    // Draw the image initially
    drawImage();
  };

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Move to center of canvas, rotate, scale, then move back
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    // Draw the image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    
    // If in crop mode, draw crop overlay
    if (isCropping) {
      // Restore context to draw overlay without rotation/scale
      ctx.restore();
      ctx.save();
      
      // Darken the entire canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear the crop area
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw border around crop area
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw resize handles
      // ... code for drawing resize handles (omitted for brevity)
    }
    
    // Restore context state
    ctx.restore();
  };

  useEffect(() => {
    drawImage();
  }, [scale, rotation, position, isCropping, cropArea]);

  const handleZoomChange = (zoomFactor: number) => {
    setScale(zoomFactor);
  };

  const handleCropStart = () => {
    setIsCropping(true);
    toast({
      title: "Modo de recorte",
      description: "Arraste para selecionar a área de recorte."
    });
  };

  const handleMoveStart = () => {
    setIsDragging(true);
    toast({
      title: "Modo de movimento",
      description: "Arraste para mover a imagem."
    });
  };

  const handleRotate = () => {
    // Rotate 90 degrees clockwise
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsCropping(false);
    initCanvas();
    toast({
      title: "Redefinido",
      description: "Alterações foram desfeitas."
    });
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    
    try {
      // If cropping, apply crop
      if (isCropping) {
        applyCrop();
      }
      
      // Get the final image URL
      const finalImageUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      
      // Pass back to parent component
      onSave(finalImageUrl);
      
      toast({
        title: "Imagem salva",
        description: "As edições foram aplicadas com sucesso."
      });
      
    } catch (error) {
      console.error('Error applying changes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar as alterações.",
        variant: "destructive"
      });
    }
  };

  const applyCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a temporary canvas for the cropped area
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Set dimensions of temp canvas to crop area
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    
    // Draw the cropped portion to the temp canvas
    tempCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Reset main canvas dimensions
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Draw the cropped image back to the main canvas
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Reset crop mode and position
    setIsCropping(false);
    setPosition({ x: 0, y: 0 });
    
    // Create a new image from the cropped canvas
    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
      setScale(1);
      setRotation(0);
    };
    newImg.src = canvas.toDataURL('image/jpeg');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to account for CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    setDragStart({ x: canvasX, y: canvasY });
    
    if (isCropping) {
      // Start new crop area
      setCropArea({ x: canvasX, y: canvasY, width: 0, height: 0 });
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isDragging && !isCropping)) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    if (isDragging) {
      // Move the image
      const deltaX = canvasX - dragStart.x;
      const deltaY = canvasY - dragStart.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX / 5, // Dampen movement for more control
        y: prev.y + deltaY / 5
      }));
      
      setDragStart({ x: canvasX, y: canvasY });
    } else if (isCropping) {
      // Update crop area width and height
      setCropArea(prev => ({
        ...prev,
        width: canvasX - prev.x,
        height: canvasY - prev.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-gray-900 p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Editor de Imagem</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        </div>
        
        <div className="flex-1 overflow-auto relative">
          <div className="flex items-center justify-center h-full">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[70vh] object-contain bg-gray-800"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleApply} className="bg-gradient-to-r from-purple-500 to-blue-500">
            Aplicar
          </Button>
        </div>

        <ImageEditingMenu
          isOpen={isMenuOpen}
          onZoomChange={handleZoomChange}
          onCropStart={handleCropStart}
          onMoveStart={handleMoveStart}
          onRotate={handleRotate}
          onReset={handleReset}
          onApply={handleApply}
          currentZoom={scale * 100}
        />
      </div>
    </div>
  );
};

export default ImageEditor;
