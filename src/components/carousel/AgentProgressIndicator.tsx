import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, Edit3, Users, Eye, Settings } from 'lucide-react';

interface AgentProgressProps {
  progress: {
    stage: string;
    message: string;
    progress: number;
  } | null;
  logs: string[];
  isStreaming: boolean;
}

const agentConfig = {
  roteirista: {
    icon: Edit3,
    title: 'Roteirista',
    description: 'Criando narrativa envolvente',
    color: 'bg-blue-500'
  },
  copywriter: {
    icon: Users,
    title: 'Copywriter', 
    description: 'Aplicando técnicas de persuasão',
    color: 'bg-green-500'
  },
  editor: {
    icon: Settings,
    title: 'Editor',
    description: 'Otimizando estrutura e fluxo',
    color: 'bg-orange-500'
  },
  supervisor: {
    icon: Eye,
    title: 'Supervisor',
    description: 'Refinamento final e qualidade',
    color: 'bg-purple-500'
  }
};

const AgentProgressIndicator: React.FC<AgentProgressProps> = ({ 
  progress, 
  logs, 
  isStreaming 
}) => {
  const [savedLogs, setSavedLogs] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    if (logs.length > 0) {
      setSavedLogs(logs);
    }
  }, [logs]);
  
  if (!isStreaming && !progress && savedLogs.length === 0) return null;

  const getAgentStatus = (agentType: string) => {
    if (!progress) return 'pending';
    if (progress.stage === agentType) return 'active';
    
    const stages = ['roteirista', 'copywriter', 'editor', 'supervisor'];
    const currentIndex = stages.indexOf(progress.stage);
    const agentIndex = stages.indexOf(agentType);
    
    // Se progress é 100%, todos os agentes estão completos
    if (progress.progress === 100) return 'completed';
    
    return agentIndex < currentIndex ? 'completed' : 'pending';
  };

  const shouldShowAgent = (agentType: string) => {
    if (!progress) return false;
    
    const stages = ['roteirista', 'copywriter', 'editor', 'supervisor'];
    const currentIndex = stages.indexOf(progress.stage);
    const agentIndex = stages.indexOf(agentType);
    
    // Mostrar agentes até o atual + próximo
    return agentIndex <= currentIndex + 1;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-end">
          {progress && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              {progress.progress}%
            </Badge>
          )}
        </div>

        {progress && (
          <div className="space-y-2">
            <Progress value={progress.progress} className="h-2" />
            <p className="text-sm text-gray-300">{progress.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(agentConfig).map(([key, config], index) => {
            const status = getAgentStatus(key);
            const shouldShow = shouldShowAgent(key);
            const IconComponent = config.icon;
            
            if (!shouldShow) return null;
            
            return (
              <div 
                key={key}
                className={`p-3 rounded-lg border-2 transition-all duration-500 animate-fade-in ${
                  status === 'active' 
                    ? 'border-blue-500 bg-blue-500/10 scale-105' 
                    : status === 'completed'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-700/50'
                }`}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full transition-all duration-300 ${config.color}/20 ${
                    status === 'active' ? 'scale-110' : ''
                  }`}>
                    {status === 'active' ? (
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    ) : status === 'completed' ? (
                      <Check className="h-4 w-4 text-green-400 animate-scale-in" />
                    ) : (
                      <IconComponent className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      status === 'active' ? 'text-blue-300' 
                      : status === 'completed' ? 'text-green-300'
                      : 'text-gray-400'
                    }`}>
                      {config.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(isStreaming || savedLogs.length > 0) && (
          <div className="space-y-1 max-h-40 overflow-y-auto scroll-smooth" id="logs-container">
            <div className="flex items-center gap-2">
              <h4 className="text-xs text-gray-400 font-medium">Logs em tempo real:</h4>
              {isStreaming && logs.length === 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                </div>
              )}
              {!isStreaming && savedLogs.length > 0 && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                  Concluído
                </Badge>
              )}
            </div>
            {logs.length === 0 && savedLogs.length === 0 ? (
              <div className="text-xs text-gray-500 font-mono italic opacity-70 animate-pulse">
                Aguardando inicialização dos agentes...
              </div>
            ) : (
              <div className="space-y-1">
                {(logs.length > 0 ? logs : savedLogs).slice(-10).map((log, index) => (
                  <div 
                    key={index} 
                    className="text-xs text-gray-400 font-mono leading-relaxed animate-in fade-in duration-300 slide-in-from-left-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-gray-600 mr-2">
                      {new Date().toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </span>
                    {log}
                  </div>
                ))}
                {isStreaming && logs.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-mono">Processando...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentProgressIndicator;