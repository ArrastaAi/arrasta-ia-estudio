import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FirebaseAPIKeyManagementPanel from '@/components/settings/FirebaseAPIKeyManagementPanel';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { user, loading } = useFirebaseAuth();

  // Redirecionar para a página de login se o usuário não estiver autenticado
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
            <p className="text-gray-400">
              Gerencie suas configurações e chaves de API para integrações com serviços externos
            </p>
          </div>

          <div className="space-y-8">
            {/* Painel de gerenciamento de chaves de API */}
            <FirebaseAPIKeyManagementPanel className="w-full" />
            
            {/* Outros painéis de configuração podem ser adicionados aqui no futuro */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
