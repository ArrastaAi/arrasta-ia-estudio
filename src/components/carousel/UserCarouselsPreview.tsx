
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserCarousels } from "@/hooks/useUserCarousels";
import { useNavigate } from "react-router-dom";
import { Eye, Calendar, Layout, Bug, Database, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const UserCarouselsPreview: React.FC = () => {
  const { carousels, loading, debugInfo } = useUserCarousels();
  const navigate = useNavigate();

  console.log('[UserCarouselsPreview] Renderizando com dados:', {
    carousels_count: carousels.length,
    loading,
    debugInfo
  });

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
      case "feed_square": return "Instagram/LinkedIn";
      case "stories": return "Stories";
      case "pinterest": return "Pinterest";
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
      console.error('[UserCarouselsPreview] Erro ao formatar data:', error);
      return "Data não disponível";
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Seus Carrosséis</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
            {carousels.length} encontrados
          </Badge>
          {debugInfo?.index_issue && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Índice necessário
            </Badge>
          )}
          {debugInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('[DEBUG INFO]', debugInfo)}
              className="p-1 text-gray-400 hover:text-white"
              title="Ver informações de debug no console"
            >
              <Bug className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {debugInfo && (
        <div className="mb-3 p-2 bg-gray-750 rounded border border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Debug Info</span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>User ID: {debugInfo.user_id}</div>
            <div>Docs encontrados: {debugInfo.docs_found || 0}</div>
            <div>Última busca: {debugInfo.last_search}</div>
            {debugInfo.error && (
              <div className="text-red-400">Erro: {debugInfo.error}</div>
            )}
            {debugInfo.index_issue && (
              <div className="text-yellow-400">
                ⚠️ Índice do Firebase necessário para ordenação
              </div>
            )}
          </div>
        </div>
      )}

      {carousels.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {debugInfo?.error ? 
              "Erro ao carregar carrosséis" : 
              "Nenhum carrossel criado ainda"
            }
          </div>
          {debugInfo?.query_executed && !debugInfo?.error && (
            <p className="text-xs text-gray-500">
              Query executada com sucesso, mas nenhum resultado encontrado
            </p>
          )}
          {debugInfo?.index_issue && (
            <p className="text-xs text-yellow-500">
              Criar índice no Firebase Console para resolver este problema
            </p>
          )}
        </div>
      ) : (
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
                      {formatSafeDate(carousel.updated_at)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('[UserCarouselsPreview] Navegando para carrossel:', carousel.id);
                    navigate(`/editor/${carousel.id}`);
                  }}
                  className="text-purple-400 hover:text-purple-300 hover:bg-gray-600 p-1"
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
