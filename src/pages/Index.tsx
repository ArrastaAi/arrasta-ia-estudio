
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, Zap, Target, Layout, Palette, 
  Upload, Share2, BarChart3, Users, Star, ArrowRight,
  CheckCircle, Play, Eye, Download
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "IA Cooperativa",
      description: "3 agentes especializados trabalham em conjunto para criar conteúdo profissional",
      badge: "Novidade"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Automação n8n",
      description: "Workflows inteligentes que automatizam todo o processo de criação",
      badge: "Pro"
    },
    {
      icon: <Layout className="w-8 h-8 text-green-500" />,
      title: "Layouts Inteligentes",
      description: "Formatos otimizados para Instagram, Pinterest, Facebook, LinkedIn e YouTube",
      badge: ""
    },
    {
      icon: <Palette className="w-8 h-8 text-pink-500" />,
      title: "Biblioteca Visual",
      description: "Fundos profissionais por nicho: barbeiro, energia solar, IA, manutenção",
      badge: ""
    },
    {
      icon: <Upload className="w-8 h-8 text-orange-500" />,
      title: "Upload Múltiplo",
      description: "Até 20 imagens com organização automática e otimização",
      badge: ""
    },
    {
      icon: <Share2 className="w-8 h-8 text-cyan-500" />,
      title: "Integração Social",
      description: "Publique diretamente no Instagram, Pinterest, Facebook e LinkedIn",
      badge: "Beta"
    }
  ];

  const stats = [
    { number: "50k+", label: "Carrosséis Criados", icon: <BarChart3 className="w-6 h-6" /> },
    { number: "12k+", label: "Usuários Ativos", icon: <Users className="w-6 h-6" /> },
    { number: "98%", label: "Satisfação", icon: <Star className="w-6 h-6" /> },
    { number: "2.3s", label: "Tempo Médio IA", icon: <Zap className="w-6 h-6" /> }
  ];

  const useCases = [
    {
      title: "Barbeiros & Salões",
      description: "Templates focados em transformação visual, antes/depois e promoções",
      image: "💇‍♂️",
      examples: ["Transformações", "Promoções", "Dicas de cuidado"]
    },
    {
      title: "Energia Solar",
      description: "Conteúdo educativo sobre sustentabilidade e economia de energia",
      image: "☀️",
      examples: ["Economia mensal", "Sustentabilidade", "Instalação"]
    },
    {
      title: "Empreendedores",
      description: "Estratégias de vendas, motivação e crescimento empresarial",
      image: "📈",
      examples: ["Vendas", "Motivação", "Estratégias"]
    },
    {
      title: "Consultores IA",
      description: "Demonstrações de tecnologia e casos de sucesso em automação",
      image: "🤖",
      examples: ["Automação", "Cases", "Tecnologia"]
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm mb-4">
              🚀 Novo: IA Cooperativa + Automação n8n
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              🧠 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ArrastaAí</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
              "Tu arrasta. A IA cria."
            </p>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Um estúdio de carrosséis com inteligência, alma e propósito. 
              Crie conteúdo profissional em minutos usando nossa IA cooperativa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Criar Carrossel Grátis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700">
                  <div className="text-blue-400 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Revolucionárias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para criadores de conteúdo que querem resultados profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <Badge variant={feature.badge === 'Novidade' ? 'default' : 'secondary'}>
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Casos de Uso Especializados
            </h2>
            <p className="text-xl text-gray-600">
              Templates e recursos otimizados para diferentes nichos profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{useCase.image}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                      <p className="text-gray-600 mb-4">{useCase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {useCase.examples.map((example, i) => (
                          <Badge key={i} variant="outline">{example}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Como Funciona em 4 Passos
            </h2>
            <p className="text-xl text-gray-400">
              Do conceito ao carrossel viral em minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Configure",
                description: "Defina título, objetivo e formato do carrossel",
                icon: <Target className="w-8 h-8" />
              },
              {
                step: "2", 
                title: "IA Cria",
                description: "Agentes especializados geram conteúdo profissional",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "3",
                title: "Personalize",
                description: "Adicione imagens, escolha templates e ajuste estilos",
                icon: <Palette className="w-8 h-8" />
              },
              {
                step: "4",
                title: "Publique",
                description: "Exporte ou publique diretamente nas redes sociais",
                icon: <Share2 className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-blue-400 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para Revolucionar Seus Carrosséis?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de criadores que já transformaram seus resultados com o ArrastaAí
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                <Eye className="w-5 h-5 mr-2" />
                Ver Exemplos
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>IA ilimitada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
