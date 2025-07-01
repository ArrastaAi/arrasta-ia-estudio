
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserCarousels } from "@/hooks/useUserCarousels";
import { useNavigate } from "react-router-dom";
import { Eye, Calendar, Layout } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const UserCarouselsPreview: React.FC = () => {
  const { carousels, loading } = useUserCarousels();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Seus Carrosséis</h3>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            Carregando...
          </Badge>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-gray-700" />
          ))}
        </div>
      </Card>
    );
  }

  const getLayoutDisplayName = (layoutType: string) => {
    switch (layoutType) {
      case "instagram_rect": return "Instagram";
      case "feed_square": return "LinkedIn";
      case "stories": return "Stories";
      case "facebook": return "Facebook";
      default: return layoutType;
    }
  };

  const formatSafeDate = (dateString: string) => {
    try {
      if (!dateString) return "Data não disponível";
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return "Data não disponível";
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Seus Carrosséis</h3>
        <Badge variant="secondary" className="bg-green-500/20 text-green-300">
          {carousels.length} encontrados
        </Badge>
      </div>

      {carousels.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Nenhum carrossel criado ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Crie seu primeiro carrossel para começar
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {carousels.map((carousel) => (
            <Card key={carousel.id} className="bg-gray-700 border-gray-600 p-4 hover:bg-gray-650 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate mb-2">
                    {carousel.title || "Carrossel sem título"}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Layout className="h-3 w-3" />
                      <span>{getLayoutDisplayName(carousel.layout_type)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatSafeDate(carousel.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/editor/${carousel.id}`)}
                  className="text-purple-400 hover:text-purple-300 hover:bg-gray-600 p-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default UserCarouselsPreview;
