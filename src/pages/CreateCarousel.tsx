
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Sparkles, Upload, Palette, Layout, Brain, 
  ArrowRight, Save, Eye, Settings, Zap
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { AIAgentsInterface } from '@/components/ai/AIAgentsInterface';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Carousel, CarouselTemplate, DesignAsset } from '@/types';

const CreateCarousel = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  
  const [step, setStep] = useState(1);
  const [carouselData, setCarouselData] = useState({
    title: '',
    description: '',
    layout_type: 'instagram_rect' as const,
    target_audience: '',
    objective: '',
    style: 'professional'
  });
  
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CarouselTemplate | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<DesignAsset[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const layouts = [
    { 
      id: 'instagram_rect', 
      name: 'Instagram Feed', 
      description: 'Quadrado 1080x1080px - Ideal para posts do feed',
      dimensions: '1:1',
      platforms: ['Instagram', 'LinkedIn']
    },
    { 
      id: 'stories', 
      name: 'Stories', 
      description: 'Vertical 1080x1920px - Stories e TikTok',
      dimensions: '9:16',
      platforms: ['Instagram', 'TikTok', 'Snapchat']
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      description: 'Vertical 1000x1500px - Otimizado para Pinterest',
      dimensions: '2:3',
      platforms: ['Pinterest']
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      description: 'Horizontal 1200x630px - Posts e anúncios',
      dimensions: '1.91:1',
      platforms: ['Facebook', 'Twitter']
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      description: 'Horizontal 1280x720px - Thumbnails e stories',
      dimensions: '16:9',
      platforms: ['YouTube']
    }
  ];

  const objectives = [
    { id: 'venda', name: 'Venda Direta', description: 'Foco em conversão e vendas' },
    { id: 'educativo', name: 'Educacional', description: 'Informar e educar o público' },
    { id: 'inspiracional', name: 'Inspiração', description: 'Motivar e inspirar' },
    { id: 'promocional', name: 'Promocional', description: 'Divulgar ofertas e promoções' },
    { id: 'branding', name: 'Branding', description: 'Fortalecer a marca' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (uploadedImages.length + files.length > 20) {
      toast.error('Máximo de 20 imagens permitido');
      return;
    }

    setUploadedImages(prev => [...prev, ...files]);
    toast.success(`${files.length} imagem(ns) adicionada(s)`);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (template: CarouselTemplate) => {
    setSelectedTemplate(template);
    setCarouselData(prev => ({
      ...prev,
      layout_type: template.template_data.layout || prev.layout_type,
      objective: template.category
    }));
    toast.success(`Template "${template.name}" selecionado!`);
  };

  const handleAssetSelect = (asset: DesignAsset) => {
    setSelectedAssets(prev => [...prev, asset]);
  };

  const handleAIContentApply = (content: string, agentType: string) => {
    setAiGenerated(true);
    setCarouselData(prev => ({
      ...prev,
      description: content,
      ai_agent: agentType
    }));
    toast.success('Conteúdo da IA aplicado com sucesso!');
  };

  const createCarousel = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!carouselData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setLoading(true);

      // Criar slides baseado no template ou padrão
      const slideCount = selectedTemplate?.template_data.slides || 7;
      const slides = Array.from({ length: slideCount }, (_, index) => ({
        id: `slide-${index + 1}`,
        order_index: index,
        background: { type: 'color' as const, value: '#ffffff' },
        elements: {
          texts: [{
            id: `text-${index + 1}`,
            content: carouselData.description ? 
              `Slide ${index + 1}: ${carouselData.description.split('\n')[index] || 'Conteúdo do slide'}` :
              `Slide ${index + 1}`,
            position: { x: 10, y: 20 },
            styles: {
              fontSize: 24,
              fontFamily: 'Arial',
              fontWeight: 'bold' as const,
              textAlign: 'left' as const,
              textColor: '#000000'
            }
          }],
          images: []
        },
        effects: {}
      }));

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('carousels')
        .insert({
          title: carouselData.title,
          description: carouselData.description,
          layout_type: carouselData.layout_type,
          style_theme: carouselData.style,
          narrative_style: carouselData.objective,
          content: JSON.stringify({ slides }),
          ai_generated: aiGenerated,
          published: false,
          user_id: user.uid
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar slides
      const slidesData = slides.map(slide => ({
        carousel_id: data.id,
        order_index: slide.order_index,
        content: JSON.stringify(slide.elements),
        background_type: slide.background.type,
        background_value: slide.background.value,
        effects: slide.effects
      }));

      const { error: slidesError } = await supabase
        .from('slides')
        .insert(slidesData);

      if (slidesError) throw slidesError;

      toast.success('Carrossel criado com sucesso!');
      navigate(`/editor/${data.id}`);

    } catch (error) {
      console.error('Erro ao criar carrossel:', error);
      toast.error('Erro ao criar carrossel');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => (step / 4) * 100;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧠 Criar Novo Carrossel
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              "Tu arrasta. A IA cria."
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Passo {step} de 4</span>
                <span>{Math.round(getStepProgress())}%</span>
              </div>
              <Progress value={getStepProgress()} className="mb-4" />
            </div>
          </div>

          {/* Steps */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Settings className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Configurações Básicas</h2>
                  <p className="text-gray-400">Defina o título, objetivo e formato do seu carrossel</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white">Título do Carrossel *</Label>
                      <Input
                        id="title"
                        value={carouselData.title}
                        onChange={(e) => setCarouselData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: 5 Dicas para Aumentar Vendas"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="audience" className="text-white">Público-Alvo</Label>
                      <Input
                        id="audience"
                        value={carouselData.target_audience}
                        onChange={(e) => setCarouselData(prev => ({ ...prev, target_audience: e.target.value }))}
                        placeholder="Ex: Empreendedores iniciantes"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Objetivo do Carrossel</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {objectives.map((obj) => (
                          <Card 
                            key={obj.id}
                            className={`cursor-pointer transition-all ${
                              carouselData.objective === obj.id 
                                ? 'bg-blue-600 border-blue-500' 
                                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            }`}
                            onClick={() => setCarouselData(prev => ({ ...prev, objective: obj.id }))}
                          >
                            <CardContent className="p-3">
                              <h4 className="font-medium text-white">{obj.name}</h4>
                              <p className="text-sm text-gray-300">{obj.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Formato e Plataforma</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {layouts.map((layout) => (
                        <Card 
                          key={layout.id}
                          className={`cursor-pointer transition-all ${
                            carouselData.layout_type === layout.id 
                              ? 'bg-blue-600 border-blue-500' 
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          }`}
                          onClick={() => setCarouselData(prev => ({ ...prev, layout_type: layout.id as any }))}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">{layout.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {layout.dimensions}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{layout.description}</p>
                            <div className="flex gap-1">
                              {layout.platforms.map((platform) => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!carouselData.title.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo: Conteúdo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Geração de Conteúdo com IA</h2>
                  <p className="text-gray-400">Use nossos agentes especializados para criar conteúdo profissional</p>
                </div>

                <div className="h-96">
                  <AIAgentsInterface 
                    onApplyToCarousel={handleAIContentApply}
                    className="h-full"
                  />
                </div>

                {aiGenerated && (
                  <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Conteúdo IA Aplicado!</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      O conteúdo gerado pela IA foi integrado ao seu carrossel. Você pode continuar para a próxima etapa.
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo: Recursos Visuais <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Palette className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Recursos Visuais</h2>
                  <p className="text-gray-400">Adicione imagens próprias ou escolha da nossa biblioteca</p>
                </div>

                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="upload" className="text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Imagens
                    </TabsTrigger>
                    <TabsTrigger value="library" className="text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Biblioteca
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Adicione suas imagens</h3>
                      <p className="text-gray-400 mb-4">
                        Clique aqui ou arraste até 20 imagens (JPG, PNG, GIF)
                      </p>
                      <Badge variant="outline" className="text-gray-300">
                        {uploadedImages.length}/20 imagens
                      </Badge>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="library">
                    <TemplateLibrary 
                      onSelectTemplate={handleTemplateSelect}
                      onSelectAsset={handleAssetSelect}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={() => setStep(4)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo: Finalizar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Finalizar Carrossel</h2>
                  <p className="text-gray-400">Revise as configurações e crie seu carrossel</p>
                </div>

                {/* Resumo */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Resumo do Projeto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Informações Básicas</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li><strong>Título:</strong> {carouselData.title}</li>
                          <li><strong>Formato:</strong> {layouts.find(l => l.id === carouselData.layout_type)?.name}</li>
                          <li><strong>Objetivo:</strong> {objectives.find(o => o.id === carouselData.objective)?.name}</li>
                          <li><strong>Público:</strong> {carouselData.target_audience || 'Não especificado'}</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Recursos</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li><strong>Imagens:</strong> {uploadedImages.length} uploadeadas</li>
                          <li><strong>Template:</strong> {selectedTemplate?.name || 'Nenhum selecionado'}</li>
                          <li><strong>Assets:</strong> {selectedAssets.length} selecionados</li>
                          <li><strong>IA:</strong> {aiGenerated ? '✅ Conteúdo gerado' : '❌ Não utilizada'}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(3)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Voltar
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={createCarousel}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        'Criando...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Criar Carrossel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCarousel;
