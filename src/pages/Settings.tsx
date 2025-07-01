
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
            <p className="text-gray-400">
              Gerencie suas configurações de conta e preferências
            </p>
          </div>

          <div className="space-y-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Configurações em Desenvolvimento
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Painel de configurações será implementado em breve
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-white text-lg mb-2">Em construção</p>
                <p className="text-gray-400">
                  Esta seção estará disponível em breve com opções de personalização e configurações avançadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
