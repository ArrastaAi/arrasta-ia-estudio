
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Instagram, LayoutGrid, LayoutList, Image, RectangleHorizontal, RectangleVertical } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { firestore } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const layoutOptions = [
  { id: "instagram_rect", name: "Instagram (Retangular)", icon: <Instagram className="w-6 h-6" />, description: "Post retangular ideal para Instagram" },
  { id: "feed_square", name: "Instagram/LinkedIn (Quadrado)", icon: <LayoutGrid className="w-6 h-6" />, description: "Formato quadrado padrão" },
  { id: "stories", name: "Instagram/TikTok (Stories)", icon: <LayoutList className="w-6 h-6" />, description: "Formato vertical para stories" },
  { id: "pinterest", name: "Pinterest (Vertical)", icon: <RectangleVertical className="w-6 h-6" />, description: "Formato vertical para Pinterest" },
  { id: "facebook", name: "Facebook (Horizontal)", icon: <RectangleHorizontal className="w-6 h-6" />, description: "Formato horizontal para Facebook" },
  { id: "youtube", name: "YouTube (Miniatura)", icon: <Image className="w-6 h-6" />, description: "Formato para miniaturas do YouTube" },
];

const narrativeOptions = [
  { id: "storytelling", name: "Storytelling" },
  { id: "lista", name: "Lista" },
  { id: "impacto_direto", name: "Impacto Direto" },
];

const CreateCarousel = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    layout_type: "instagram_rect", // Alterado para ter o formato retangular como padrão
    narrative_style: "storytelling",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    try {
      setLoading(true);

      if (user) {
        // Criar um novo documento na coleção "carousels" com um ID gerado automaticamente
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

        // Redirecionar para o editor com o ID do novo carrossel
        navigate(`/editor/${newCarouselRef.id}`);
      } else {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
      }
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
      <div className="bg-gray-900 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white mb-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Criar Novo Carrossel</h1>
            <p className="text-gray-400">
              Configure as informações básicas do seu carrossel
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">
                        Título do Carrossel
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ex: 5 Dicas para Aumentar suas Vendas"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Descrição (opcional)
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        placeholder="Uma breve descrição do seu carrossel"
                        className="bg-gray-700 border-gray-600 text-white h-24"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">Layout</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Formato recomendado/destacado - Instagram Retangular */}
                        <div
                          className={`relative cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center transition-all ${
                            formData.layout_type === "instagram_rect"
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-gray-700 hover:border-gray-500"
                          } col-span-1 md:col-span-2`}
                          onClick={() => handleSelectChange("layout_type", "instagram_rect")}
                        >
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded absolute -top-2 right-2">
                            Recomendado
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            <Instagram className="w-8 h-8 mr-2 text-purple-400" />
                            <span className="text-lg font-medium">Instagram (Retangular)</span>
                          </div>
                          <div className="w-full max-w-[270px] h-[190px] bg-gray-700 rounded-md flex items-center justify-center border border-gray-600 mb-3">
                            <div className="text-sm text-gray-400">Formato 4:5 (Retangular)</div>
                          </div>
                          <p className="text-sm text-gray-300 text-center">
                            Formato retangular ideal para Instagram com proporção 4:5
                          </p>
                          {formData.layout_type === "instagram_rect" && (
                            <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-purple-500"></div>
                          )}
                        </div>

                        {/* Outros formatos */}
                        {layoutOptions.filter(layout => layout.id !== "instagram_rect").map((layout) => (
                          <div
                            key={layout.id}
                            className={`relative cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center transition-all ${
                              formData.layout_type === layout.id
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-gray-700 hover:border-gray-500"
                            }`}
                            onClick={() => handleSelectChange("layout_type", layout.id)}
                          >
                            <div className="flex items-center mb-2">
                              {layout.icon}
                              <span className="text-sm ml-2">{layout.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                              {layout.description}
                            </p>
                            {formData.layout_type === layout.id && (
                              <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="narrative_style" className="text-white">
                        Estilo Narrativo
                      </Label>
                      <Select
                        value={formData.narrative_style}
                        onValueChange={(value) => handleSelectChange("narrative_style", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione um estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          {narrativeOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                  disabled={loading}
                >
                  {loading ? "Criando..." : "Próximo Passo"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCarousel;
