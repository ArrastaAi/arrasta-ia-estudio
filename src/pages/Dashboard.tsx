import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileEdit, ArrowRight, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Carousel } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { db, firestore } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";

const Dashboard = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchCarousels = async () => {
      try {
        setLoading(true);

        const carouselsCollectionRef = collection(db, "carousels");
        const carouselsQuery = query(
          carouselsCollectionRef,
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const carouselsSnapshot = await getDocs(carouselsQuery);

        const carouselsList: Carousel[] = carouselsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          layout_type: doc.data().layout_type || "instagram_rect", // Define um valor padrão
        } as Carousel));

        setCarousels(carouselsList);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar carrosséis",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarousels();
  }, [user, navigate, toast]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const carouselDocRef = doc(db, "carousels", id);
      await deleteDoc(carouselDocRef);

      setCarousels(carousels.filter((carousel) => carousel.id !== id));
      toast({
        title: "Carrossel excluído com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir carrossel",
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meus Carrosséis</h1>
              <p className="text-gray-400">
                Gerencie e edite seus carrosséis ou crie novos
              </p>
            </div>
            <Button
              asChild
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Link to="/create">
                <Plus className="mr-2 h-4 w-4" /> Criar Novo
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="published">Publicados</TabsTrigger>
              <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="h-48 bg-gray-700 rounded-md animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : carousels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carousels.map((carousel) => (
                    <Card
                      key={carousel.id}
                      className="bg-gray-800 border-gray-700 overflow-hidden"
                    >
                      <CardHeader className="p-0">
                        <div className="h-48 bg-gray-700 relative">
                          {/* Placeholder para a miniatura do carrossel */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            {carousel.layout_type === "feed_square"
                              ? "Quadrado"
                              : carousel.layout_type === "stories"
                              ? "Stories"
                              : carousel.layout_type === "pinterest"
                              ? "Pinterest"
                              : carousel.layout_type === "facebook"
                              ? "Facebook"
                              : "YouTube"}
                          </div>
                          {carousel.published && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Publicado
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="text-white text-xl mb-2">
                          {carousel.title}
                        </CardTitle>
                        <p className="text-gray-400 line-clamp-2">
                          {carousel.description || "Sem descrição"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between p-6 pt-0 border-t border-gray-700">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-purple-500 text-purple-500"
                        >
                          <Link to={`/editor/${carousel.id}`}>
                            <FileEdit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(carousel.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-800 p-4 rounded-full mb-6">
                    <Plus className="h-10 w-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Crie seu primeiro carrossel
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Você ainda não criou nenhum carrossel. Comece agora e impressione seu público!
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    <Link to="/create">
                      <Plus className="mr-2 h-4 w-4" /> Criar Carrossel
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="published">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : carousels.filter((c) => c.published).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carousels
                    .filter((c) => c.published)
                    .map((carousel) => (
                      <Card
                        key={carousel.id}
                        className="bg-gray-800 border-gray-700 overflow-hidden"
                      >
                        <CardHeader className="p-0">
                          <div className="h-48 bg-gray-700 relative">
                            {/* Placeholder para a miniatura do carrossel */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                              {carousel.layout_type}
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Publicado
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <CardTitle className="text-white text-xl mb-2">
                            {carousel.title}
                          </CardTitle>
                          <p className="text-gray-400 line-clamp-2">
                            {carousel.description || "Sem descrição"}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between p-6 pt-0 border-t border-gray-700">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-purple-500 text-purple-500"
                          >
                            <Link to={`/editor/${carousel.id}`}>
                              <FileEdit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(carousel.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum carrossel publicado
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Você ainda não publicou nenhum carrossel.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : carousels.filter((c) => !c.published).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carousels
                    .filter((c) => !c.published)
                    .map((carousel) => (
                      <Card
                        key={carousel.id}
                        className="bg-gray-800 border-gray-700 overflow-hidden"
                      >
                        <CardHeader className="p-0">
                          <div className="h-48 bg-gray-700 relative">
                            {/* Placeholder para a miniatura do carrossel */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                              {carousel.layout_type}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <CardTitle className="text-white text-xl mb-2">
                            {carousel.title}
                          </CardTitle>
                          <p className="text-gray-400 line-clamp-2">
                            {carousel.description || "Sem descrição"}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between p-6 pt-0 border-t border-gray-700">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-purple-500 text-purple-500"
                          >
                            <Link to={`/editor/${carousel.id}`}>
                              <FileEdit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(carousel.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum rascunho
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Você não tem rascunhos de carrosséis no momento.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
