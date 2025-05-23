
import React from 'react';
import { FileText, Image, MessageCircle, Facebook, Instagram, Twitter, Linkedin, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DevelopmentTabProps {
  title: string;
  description: string;
  estimatedRelease?: string;
  isExportEnabled?: boolean;
  onExport?: (format: string) => void;
  onShare?: (platform: string) => void;
}

const DevelopmentTab: React.FC<DevelopmentTabProps> = ({
  title,
  description,
  estimatedRelease,
  isExportEnabled = true,
  onExport,
  onShare
}) => {
  return (
    <div className="space-y-6">
      {!isExportEnabled && (
        <div className="text-center py-6 px-4">
          <div className="bg-gray-700 rounded-lg p-8">
            <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-4">{description}</p>
            {estimatedRelease && (
              <div className="inline-block bg-gray-600 px-3 py-1 rounded-full text-sm text-gray-300">
                Previsão: {estimatedRelease}
              </div>
            )}
          </div>
        </div>
      )}

      {isExportEnabled && onExport && (
        <div className="space-y-5">
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Exportar para</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => onExport('PNG')}>
                <Image className="h-6 w-6 mb-2" />
                <span>PNG</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => onExport('PDF')}>
                <FileText className="h-6 w-6 mb-2" />
                <span>PDF</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center justify-center h-20 hover:border-blue-500 hover:bg-gray-700" onClick={() => onExport('JPG')}>
                <Download className="h-6 w-6 mb-2" />
                <span>JPG</span>
              </Button>
            </div>
          </div>
          
          {onShare && (
            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Compartilhar em</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => onShare('WhatsApp')}>
                  <MessageCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => onShare('Instagram')}>
                  <Instagram className="h-5 w-5 mb-1" />
                  <span className="text-xs">Instagram</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => onShare('Facebook')}>
                  <Facebook className="h-5 w-5 mb-1" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => onShare('LinkedIn')}>
                  <Linkedin className="h-5 w-5 mb-1" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-16 hover:border-blue-500 hover:bg-gray-700" onClick={() => onShare('Twitter')}>
                  <Twitter className="h-5 w-5 mb-1" />
                  <span className="text-xs">Twitter</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DevelopmentTab;
