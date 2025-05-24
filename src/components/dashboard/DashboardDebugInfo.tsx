
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Bug } from "lucide-react";

interface DashboardDebugInfoProps {
  debugInfo: any;
  onRefresh: () => void;
}

const DashboardDebugInfo = ({ debugInfo, onRefresh }: DashboardDebugInfoProps) => {
  if (!debugInfo || Object.keys(debugInfo).length === 0) return null;

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-medium">Debug Info</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-gray-400 hover:text-white p-1"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('[DEBUG INFO]', debugInfo)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">User ID:</span>
            <p className="text-white font-mono text-xs">{debugInfo.user_id}</p>
          </div>
          <div>
            <span className="text-gray-400">Total Carrosséis:</span>
            <p className="text-white">{debugInfo.total_carousels || 0}</p>
          </div>
          <div>
            <span className="text-gray-400">Última Busca:</span>
            <p className="text-white text-xs">{debugInfo.last_fetch}</p>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <Badge variant={debugInfo.query_success ? "default" : "destructive"}>
              {debugInfo.query_success ? "Sucesso" : "Erro"}
            </Badge>
          </div>
          {debugInfo.error && (
            <div className="col-span-2">
              <span className="text-gray-400">Erro:</span>
              <p className="text-red-400 text-xs">{debugInfo.error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDebugInfo;
