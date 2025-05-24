
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Target, Users, FileText } from "lucide-react";

interface AgentInfoDisplayProps {
  agent: string;
  formData: {
    topic: string;
    audience: string;
    goal: string;
    content: string;
  };
}

const AgentInfoDisplay: React.FC<AgentInfoDisplayProps> = ({ agent, formData }) => {
  const getAgentInfo = () => {
    switch (agent) {
      case "carousel":
        return {
          name: "Criador de Carrossel",
          description: "Especialista em criar carrosséis completos e estruturados",
          icon: <Bot className="h-4 w-4" />,
          color: "bg-blue-500"
        };
      case "yuri":
        return {
          name: "Criador de Textos",
          description: "Expert em copywriting viral e persuasivo",
          icon: <FileText className="h-4 w-4" />,
          color: "bg-purple-500"
        };
      case "formatter":
        return {
          name: "Criador de Frases",
          description: "Transforma textos longos em slides formatados",
          icon: <Target className="h-4 w-4" />,
          color: "bg-green-500"
        };
      default:
        return {
          name: "Agente IA",
          description: "Gerador de conteúdo",
          icon: <Bot className="h-4 w-4" />,
          color: "bg-gray-500"
        };
    }
  };

  const agentInfo = getAgentInfo();

  return (
    <Card className="bg-gray-750 border-gray-600 p-3 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${agentInfo.color} p-2 rounded-full text-white`}>
          {agentInfo.icon}
        </div>
        <div>
          <h4 className="text-white font-medium">{agentInfo.name}</h4>
          <p className="text-gray-400 text-sm">{agentInfo.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {formData.topic && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Tema</Badge>
            <span className="text-gray-300 text-sm">{formData.topic}</span>
          </div>
        )}
        {formData.audience && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Público</Badge>
            <span className="text-gray-300 text-sm">{formData.audience}</span>
          </div>
        )}
        {formData.goal && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Objetivo</Badge>
            <span className="text-gray-300 text-sm">{formData.goal}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgentInfoDisplay;
