
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAPIKeyManager } from "@/hooks/useAPIKeyManager";
import { Progress } from "@/components/ui/progress";
import { APIKeyUsage } from "@/types/apiKeys.types";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

interface APIKeyManagementPanelProps {
  className?: string;
}

const APIKeyManagementPanel: React.FC<APIKeyManagementPanelProps> = ({ className }) => {
  const { toast } = useToast();
  const { apiKeys, loading, addAPIKey, loadAPIKeys, deleteAPIKey } = useAPIKeyManager();
  const { user } = useFirebaseAuth();
  const isAdmin = user?.email === "admin@example.com"; // Replace with your admin check logic
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyValue, setNewKeyValue] = useState<string>('');
  const [newKeyLimit, setNewKeyLimit] = useState<string>('10000');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    // Carregar chaves ao montar o componente
    loadAPIKeys();
  }, []);

  useEffect(() => {
    // Verificação adicional de segurança
    if (!isAdmin) {
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar esta área",
        variant: "destructive"
      });
    }
  }, [isAdmin]);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({
        title: "Operação não permitida",
        description: "Apenas administradores podem gerenciar chaves API",
        variant: "destructive"
      });
      return;
    }
    
    if (!newKeyName || !newKeyValue) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e valor da chave são necessários",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAdding(true);
      const limit = parseInt(newKeyLimit) || 10000;
      const success = await addAPIKey({
        key: newKeyValue,
        name: newKeyName,
        usage: 0,
        limit: limit,
        last_used: new Date().toISOString()
      });

      if (success) {
        setNewKeyName('');
        setNewKeyValue('');
        setNewKeyLimit('10000');
        toast({
          title: "Chave API adicionada",
          description: "A chave foi adicionada com sucesso"
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar chave:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a chave",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRefresh = () => {
    if (!isAdmin) {
      toast({
        title: "Operação não permitida",
        description: "Apenas administradores podem gerenciar chaves API",
        variant: "destructive"
      });
      return;
    }
    
    loadAPIKeys();
    toast({
      title: "Atualizado",
      description: "Lista de chaves API atualizada"
    });
  };

  const handleDeleteKey = async (keyId: string | undefined) => {
    if (!isAdmin) {
      toast({
        title: "Operação não permitida",
        description: "Apenas administradores podem gerenciar chaves API",
        variant: "destructive"
      });
      return;
    }
    
    if (!keyId) return;
    
    try {
      await deleteAPIKey(keyId);
      toast({
        title: "Chave removida",
        description: "A chave API foi removida com sucesso"
      });
      loadAPIKeys();
    } catch (error) {
      console.error("Erro ao remover chave:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a chave",
        variant: "destructive"
      });
    }
  };

  // Função para calcular a porcentagem de uso
  const calculateUsagePercent = (usage: number, limit: number): number => {
    if (!limit) return 0;
    const percent = (usage / limit) * 100;
    return Math.min(percent, 100);
  };

  // Função para determinar a cor da barra de progresso com base no uso
  const getProgressColor = (usage: number, limit: number): string => {
    const percent = calculateUsagePercent(usage, limit);
    if (percent < 50) return "bg-green-500";
    if (percent < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Se não for admin, mostrar mensagem de acesso restrito
  if (!isAdmin) {
    return (
      <Card className={`${className} bg-gray-800 border-gray-700`}>
        <CardHeader>
          <CardTitle className="text-white">Acesso Restrito</CardTitle>
          <CardDescription className="text-gray-400">
            Esta área é restrita apenas para administradores do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center py-8">
          <ShieldAlert className="h-20 w-20 mx-auto text-yellow-500" />
          <p className="text-white text-lg">Você não tem permissão para acessar esta página.</p>
          <p className="text-gray-400">Entre em contato com um administrador para mais informações.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gray-800 border-gray-700`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">Gerenciamento de Chaves API</CardTitle>
            <CardDescription className="text-gray-400">
              Gerencie suas chaves de API para integrações com serviços externos
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lista de chaves existentes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Chaves Disponíveis</h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-yellow-500" />
              <p>Nenhuma chave API cadastrada.</p>
              <p className="text-sm">Adicione uma chave para utilizar os recursos de IA.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key: APIKeyUsage) => (
                <div key={key.id} className="p-4 bg-gray-700 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{key.name}</h4>
                      <p className="text-xs text-gray-400">
                        {key.key.substring(0, 6)}...{key.key.slice(-4)}
                      </p>
                    </div>
                    {/* Botões de ação */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-2"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Informações de uso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uso:</span>
                      <span className="text-white">{key.usage || 0} / {key.limit || 10000}</span>
                    </div>
                    <Progress 
                      value={calculateUsagePercent(key.usage || 0, key.limit || 10000)} 
                      className={`h-2 ${getProgressColor(key.usage || 0, key.limit || 10000)}`}
                    />
                    
                    {/* Última utilização */}
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Último uso:</span>
                      <span>
                        {key.last_used 
                          ? formatDistanceToNow(new Date(key.last_used), { addSuffix: true, locale: ptBR })
                          : 'Nunca utilizada'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="border-gray-700" />

        {/* Formulário para adicionar nova chave */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Adicionar Nova Chave</h3>
          
          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-white">Nome da Chave</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="ex: OpenAI API Key"
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isAdding}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyLimit" className="text-white">Limite de Uso</Label>
                <Input
                  id="keyLimit"
                  type="number"
                  min="1"
                  value={newKeyLimit}
                  onChange={(e) => setNewKeyLimit(e.target.value)}
                  placeholder="10000"
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isAdding}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keyValue" className="text-white">Valor da Chave API</Label>
              <Input
                id="keyValue"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder="sk-..."
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isAdding}
                required
                type="password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              disabled={isAdding || !newKeyName || !newKeyValue}
            >
              {isAdding ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Adicionando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" /> 
                  Adicionar Chave
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-gray-700 pt-4 text-center">
        <p className="text-xs text-gray-400">
          As chaves são armazenadas de forma criptografada e utilizadas apenas para acessar serviços externos de IA.
        </p>
      </CardFooter>
    </Card>
  );
};

export default APIKeyManagementPanel;
