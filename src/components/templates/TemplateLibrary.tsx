
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, Download, Eye, Filter, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CarouselTemplate, DesignAsset } from '@/types';

interface TemplateLibraryProps {
  onSelectTemplate?: (template: CarouselTemplate) => void;
  onSelectAsset?: (asset: DesignAsset) => void;
  className?: string;
}

export function TemplateLibrary({ onSelectTemplate, onSelectAsset, className = '' }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<CarouselTemplate[]>([]);
  const [assets, setAssets] = useState<DesignAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  useEffect(() => {
    loadTemplatesAndAssets();
  }, []);

  const loadTemplatesAndAssets = async () => {
    try {
      setLoading(true);

      // Carregar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('carousel_templates')
        .select('*')
        .eq('is_public', true)
        .order('performance_score', { ascending: false });

      if (templatesError) throw templatesError;

      // Carregar assets de design
      const { data: assetsData, error: assetsError } = await supabase
        .from('design_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;

      setTemplates(templatesData || []);
      setAssets(assetsData || []);
    } catch (error) {
      console.error('Erro ao carregar templates e assets:', error);
      toast.error('Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || template.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || asset.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const handleUseTemplate = async (template: CarouselTemplate) => {
    try {
      // Incrementar contador de uso
      await supabase
        .from('carousel_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      onSelectTemplate?.(template);
      toast.success(`Template "${template.name}" aplicado!`);
    } catch (error) {
      toast.error('Erro ao aplicar template');
    }
  };

  const handleUseAsset = (asset: DesignAsset) => {
    onSelectAsset?.(asset);
    toast.success(`${asset.type === 'background' ? 'Fundo' : 'Elemento'} "${asset.name}" selecionado!`);
  };

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'venda', label: 'Venda' },
    { value: 'educativo', label: 'Educativo' },
    { value: 'promocional', label: 'Promocional' },
    { value: 'inspiracional', label: 'Inspiracional' },
    { value: 'professional', label: 'Profissional' },
    { value: 'service', label: 'Serviços' }
  ];

  const subcategories = [
    { value: 'all', label: 'Todas' },
    { value: 'barbeiro', label: 'Barbeiro' },
    { value: 'cabeleireira', label: 'Cabeleireira' },
    { value: 'esteticista', label: 'Esteticista' },
    { value: 'energia_solar', label: 'Energia Solar' },
    { value: 'ia', label: 'Inteligência Artificial' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'eletrica', label: 'Elétrica' }
  ];

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 Biblioteca ArrastaAí</h2>
        <p className="text-gray-600">Templates profissionais e recursos visuais para seus carrosséis</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar templates, fundos ou elementos..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {subcategories.map(sub => (
              <option key={sub.value} value={sub.value}>{sub.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            <Sparkles className="w-4 h-4 mr-2" />
            Templates ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Eye className="w-4 h-4 mr-2" />
            Recursos Visuais ({filteredAssets.length})
          </TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{template.category}</Badge>
                        {template.subcategory && (
                          <Badge variant="outline">{template.subcategory}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {template.performance_score}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Usado {template.usage_count} vezes
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum template encontrado</p>
            </div>
          )}
        </TabsContent>

        {/* Assets */}
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleUseAsset(asset)}>
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {asset.thumbnail_url ? (
                      <img 
                        src={asset.thumbnail_url} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {asset.type === 'background' ? '🖼️' : '✨'}
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{asset.name}</h4>
                  
                  <div className="flex gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                    {asset.is_premium && (
                      <Badge variant="default" className="text-xs bg-yellow-500">
                        Pro
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum recurso encontrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
