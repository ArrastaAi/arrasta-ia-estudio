
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportTabProps {
  carouselTitle?: string;
}

const ExportTab: React.FC<ExportTabProps> = ({ carouselTitle }) => {
  const { toast } = useToast();

  const captureSlide = async (slideElement: HTMLElement): Promise<string> => {
    const canvas = await html2canvas(slideElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#000000"
    });
    return canvas.toDataURL('image/png');
  };

  const handleExport = async (format: string) => {
    try {
      toast({
        title: `Exportando para ${format}`,
        description: `Preparando seus slides para exportação.`
      });

      const carouselElement = document.querySelector('.carousel-container, [role="region"]') as HTMLElement;
      if (!carouselElement) {
        throw new Error("Não foi possível encontrar o elemento do carrossel");
      }

      const dataUrl = await captureSlide(carouselElement);

      if (format === 'PNG') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `carrossel_${carouselTitle || 'sem-titulo'}.png`;
        link.click();
      } else if (format === 'PDF') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm'
        });
        const imgWidth = 190;
        const imgHeight = imgWidth * 4 / 5;

        pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`carrossel_${carouselTitle || 'sem-titulo'}.pdf`);
      }

      toast({
        title: "Exportação concluída",
        description: `Seus slides foram exportados com sucesso no formato ${format}.`
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o carrossel. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">Exportar Carrossel</h3>
        <p className="text-gray-400 text-sm mb-6">
          Baixe seu carrossel nos formatos mais usados.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 hover:border-blue-500 hover:bg-gray-700" 
            onClick={() => handleExport('PNG')}
          >
            <Download className="h-8 w-8 mb-2" />
            <span className="font-medium">PNG</span>
            <span className="text-xs text-gray-400">Imagem</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 hover:border-blue-500 hover:bg-gray-700" 
            onClick={() => handleExport('PDF')}
          >
            <FileText className="h-8 w-8 mb-2" />
            <span className="font-medium">PDF</span>
            <span className="text-xs text-gray-400">Documento</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
