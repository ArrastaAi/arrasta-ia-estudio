
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
        <h3 className="text-lg font-medium text-white mb-4">Seus Carrosséis</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-gray-700" />
          ))}
        </div>
      </Card>
    );
  }

  if (carousels.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-lg font-medium text-white mb-4">Seus Carrosséis</h3>
        <p className="text-gray-400 text-sm">Nenhum carrossel criado ainda</p>
      </Card>
    );
  }

  const getLayoutDisplayName = (layoutType: string) => {
    switch (layoutType) {
      case "feed_square": return "Instagram/LinkedIn";
      case "stories": return "Stories";
      case "pinterest": return "Pinterest";
      case "facebook": return "Facebook";
      default: return layoutType;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <h3 className="text-lg font-medium text-white mb-4">Seus Carrosséis</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {carousels.map((carousel) => (
          <Card key={carousel.id} className="bg-gray-700 border-gray-600 p-3 hover:bg-gray-650 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">
                  {carousel.title || "Carrossel sem título"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Layout className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-400 text-xs">
                    {getLayoutDisplayName(carousel.layout_type)}
                  </span>
                  <Calendar className="h-3 w-3 text-gray-400 ml-2" />
                  <span className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(carousel.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/editor/${carousel.id}`)}
                className="text-purple-400 hover:text-purple-300 hover:bg-gray-600 p-1"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default UserCarouselsPreview;
