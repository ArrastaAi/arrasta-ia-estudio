
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Brain, PenTool, Layout, Sparkles, Send, Copy, 
  RotateCcw, CheckCircle, AlertCircle, TrendingUp,
  MessageSquare, Lightbulb, Target, Zap, User,
  FileText, Download, AlertTriangle, Check, X, ArrowDown
} from 'lucide-react';
import { useAIAgents, useAgentStats } from '@/hooks/useAIAgents';
import type { Carousel, ChatMessage } from '@/types';

interface AIAgentsInterfaceProps {
  carousel?: Carousel;
  onApplyToCarousel?: (content: string, agentType: string) => void;
  className?: string;
}

interface PendingApplication {
  messageId: string;
  content: string;
  agentType: string;
  preview: string;
}

export function AIAgentsInterface({ carousel, onApplyToCarousel, className = '' }: AIAgentsInterfaceProps) {
  const { agents, loading, generateContent, analyzeCarousel } = useAIAgents();
  const { getUsageStats } = useAgentStats();
  
  const [activeAgent, setActiveAgent] = useState<'content_strategist' | 'visual_curator' | 'engagement_optimizer'>('content_strategist');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingApplication, setPendingApplication] = useState<PendingApplication | null>(null);
  
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const addMessage = (
    agent: ChatMessage['agent'], 
    content: string, 
    type: ChatMessage['type'] = 'output',
    canApply: boolean = false
  ) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      agent,
      content,
      timestamp: new Date(),
      type,
      metadata: { canApply }
    };
    setMessages(prev => [...prev, message]);
    return message.id;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    addMessage('user', input, 'input');
    const userInput = input;
    setInput('');

    try {
      const response = await generateContent(userInput, activeAgent, {
        carouselType: 'educativo',
        slideCount: 7,
        format: 'instagram'
      });

      const messageId = addMessage(activeAgent, response, 'output', true);
      
      toast.success(`${agents[activeAgent].name} respondeu com sucesso!`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      addMessage(activeAgent, `Erro: ${errorMsg}`, 'error');
      toast.error(`Erro no ${agents[activeAgent].name}: ${errorMsg}`);
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Conteúdo copiado!');
  };

  const handleRequestApplication = (messageId: string, content: string, agentType: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const preview = `${lines.length} slides de conteúdo`;

    setPendingApplication({
      messageId,
      content,
      agentType,
      preview
    });
  };

  const handleConfirmApplication = () => {
    if (pendingApplication && onApplyToCarousel) {
      onApplyToCarousel(pendingApplication.content, pendingApplication.agentType);
      toast.success('Conteúdo aplicado ao carrossel!');
      setPendingApplication(null);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast.success('Conversa limpa!');
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
      setShowScrollToBottom(false);
      setIsAtBottom(true);
    }
  };

  const getAgentInfo = (agent: string) => {
    const agentMap = {
      content_strategist: {
        name: 'Estrategista',
        icon: <PenTool className="w-5 h-5" />,
        color: 'bg-blue-500',
        description: 'Narrativas persuasivas e estruturação de conteúdo'
      },
      visual_curator: {
        name: 'Curador Visual',
        icon: <Target className="w-5 h-5" />,
        color: 'bg-purple-500',
        description: 'Elementos visuais e composição estética'
      },
      engagement_optimizer: {
        name: 'Otimizador',
        icon: <Layout className="w-5 h-5" />,
        color: 'bg-green-500',
        description: 'Performance e métricas de engajamento'
      },
      user: {
        name: 'Você',
        icon: <User className="w-5 h-5" />,
        color: 'bg-gray-500',
        description: ''
      }
    };
    return agentMap[agent as keyof typeof agentMap] || agentMap.user;
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const agentInfo = getAgentInfo(message.agent);
    const isUser = message.agent === 'user';
    const isError = message.type === 'error';

    return (
      <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-full ${agentInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
          {agentInfo.icon}
        </div>
        
        <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white">{agentInfo.name}</span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          <div className={`p-4 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : isError 
              ? 'bg-red-900/50 border border-red-600 text-red-200'
              : 'bg-gray-700 text-gray-100'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {!isUser && !isError && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-600">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard(message.content)}
                  className="h-8 px-3 text-xs hover:bg-gray-600"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
                
                {message.metadata?.canApply && onApplyToCarousel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRequestApplication(message.id, message.content, message.agent)}
                    className="h-8 px-3 text-xs hover:bg-gray-600 text-green-400 hover:text-green-300"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Aplicar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = getUsageStats();

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${className}`}>
      {/* Confirmation Dialog */}
      {pendingApplication && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Confirmar Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-600 bg-yellow-600/10">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-200">
                  Você está prestes a aplicar este conteúdo ao seu carrossel. 
                  Esta ação substituirá o conteúdo atual.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-white font-medium mb-2">Preview:</h4>
                <p className="text-gray-300 text-sm">{pendingApplication.preview}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Agente: {getAgentInfo(pendingApplication.agentType).name}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setPendingApplication(null)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmApplication}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">🧠 ArrastaAí - IA Cooperativa</h2>
            <p className="text-sm text-gray-400">"Tu arrasta. A IA cria."</p>
          </div>
          
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {stats.remainingCalls}/{stats.dailyLimit} calls
          </Badge>
        </div>

        {/* Agent Selector */}
        <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="content_strategist" className="text-white">
              <PenTool className="w-4 h-4 mr-2" />
              Estrategista
            </TabsTrigger>
            <TabsTrigger value="visual_curator" className="text-white">
              <Target className="w-4 h-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="engagement_optimizer" className="text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Otimizador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content_strategist" className="mt-3">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <p className="text-sm text-gray-300">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Especialista em narrativas persuasivas e estruturação de conteúdo para máximo impacto.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual_curator" className="mt-3">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <p className="text-sm text-gray-300">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Curador visual especializado em composição estética e seleção de elementos visuais.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement_optimizer" className="mt-3">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <p className="text-sm text-gray-300">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Otimizador de performance focado em métricas de engajamento e conversão.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {showScrollToBottom && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              size="sm"
              onClick={scrollToBottom}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full w-10 h-10 p-0"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
          <div className="p-4 pb-8">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className={`w-16 h-16 rounded-full ${getAgentInfo(activeAgent).color} flex items-center justify-center text-white mx-auto mb-4`}>
                  {getAgentInfo(activeAgent).icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {getAgentInfo(activeAgent).name}
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {getAgentInfo(activeAgent).description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
            
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4 bg-gray-900 flex-shrink-0">
          {messages.length > 0 && (
            <div className="flex justify-center mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={clearConversation}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva seu projeto ou peça ajuda ao agente especializado..."
              rows={3}
              className="flex-1 bg-gray-800 border-gray-600 text-white resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSendMessage();
                }
              }}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="self-end bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>Ctrl/Cmd + Enter para enviar</span>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>{getAgentInfo(activeAgent).name} está processando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
