
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Instagram, LayoutGrid, RectangleVertical, RectangleHorizontal, Image } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { firestore } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const layoutOptions = [
  { 
    id: "instagram_rect", 
    name: "Instagram", 
    subtitle: "Retangular 4:5",
    icon: <Instagram className="w-8 h-8" />, 
    recommended: true,
    aspectRatio: "4:5",
    preview: "270x190"
  },
  { 
    id: "feed_square", 
    name: "LinkedIn", 
    subtitle: "Quadrado 1:1",
    icon: <LayoutGrid className="w-8 h-8" />, 
    aspectRatio: "1:1",
    preview: "200x200"
  },
  { 
    id: "stories", 
    name: "Stories", 
    subtitle: "Vertical 9:16",
    icon: <RectangleVertical className="w-8 h-8" />, 
    aspectRatio: "9:16",
    preview: "120x200"
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    subtitle: "Horizontal 16:9",
    icon: <RectangleHorizontal className="w-8 h-8" />, 
    aspectRatio: "16:9",
    preview: "280x160"
  },
];

const CreateCarousel = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    layout_type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLayoutSelect = (layoutId: string) => {
    setFormData((prev) => ({ ...prev, layout_type: layoutId }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um carrossel",
        variant: "destructive",
      });
      return;
    }

    if (!formData.layout_type) {
      toast({
        title: "Selecione um formato",
        description: "Escolha o formato do seu carrossel",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const carouselCollectionRef = collection(firestore, "carousels");
      const carouselData = {
        ...formData,
        user_id: user?.uid,
        published: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const newCarouselRef = await addDoc(carouselCollectionRef, carouselData);

      toast({
        title: "Sucesso",
        description: "Carrossel criado com sucesso!",
      });

      navigate(`/editor/${newCarouselRef.id}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header Apple-style */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white mb-6 p-2"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Novo Carrossel</h1>
              <p className="text-gray-400 text-lg">
                Crie conteúdo visual impactante
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Título - Input grande e limpo */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Label htmlFor="title" className="text-white text-lg font-medium">
                    Qual o tema do seu carrossel?
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: 5 Dicas para Aumentar suas Vendas"
                    required
                    className="bg-gray-700 border-gray-600 text-white text-lg h-12"
                  />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Descrição opcional..."
                    className="bg-gray-700 border-gray-600 text-white resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Layout - Cards grandes touch-friendly */}
            <div className="space-y-4">
              <h2 className="text-white text-lg font-medium text-center">
                Escolha o formato
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {layoutOptions.map((layout) => (
                  <Card
                    key={layout.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      formData.layout_type === layout.id
                        ? "bg-purple-500/10 border-purple-500 border-2"
                        : "bg-gray-800 border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => handleLayoutSelect(layout.id)}
                  >
                    <CardContent className="p-6">
                      {/* Badge Recomendado */}
                      {layout.recommended && (
                        <div className="absolute -top-2 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Recomendado
                        </div>
                      )}
                      
                      {/* Conteúdo do Card */}
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 text-purple-400">
                          {layout.icon}
                        </div>
                        
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {layout.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {layout.subtitle}
                        </p>
                        
                        {/* Preview Visual */}
                        <div className={`bg-gray-700 rounded-md flex items-center justify-center border border-gray-600 mb-2`}
                             style={{
                               width: layout.preview.split('x')[0] + 'px',
                               height: layout.preview.split('x')[1] + 'px',
                               maxWidth: '100%'
                             }}>
                          <div className="text-xs text-gray-400">
                            {layout.aspectRatio}
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de Seleção */}
                      {formData.layout_type === layout.id && (
                        <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Button - Proeminente estilo Apple */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.layout_type}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-lg h-14 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Criando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Criar Carrossel
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCarousel;
