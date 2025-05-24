
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileEdit, ArrowRight, Trash2, Bug, Database, RefreshCw } from "lucide-react";
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
  const [debugInfo, setDebugInfo] = useState<any>({});

  const fetchCarousels = async () => {
    if (!user) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando...');
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      console.log('[Dashboard] Iniciando busca de carrosséis:', {
        user_id: user.uid,
        user_email: user.email,
        timestamp: new Date().toISOString()
      });

      const carouselsCollectionRef = collection(db, "carousels");
      // Usar apenas user_id para evitar erro de índice
      const carouselsQuery = query(
        carouselsCollectionRef,
        where("user_id", "==", user.uid)
      );

      console.log('[Dashboard] Executando query:', {
        collection: 'carousels',
        where: `user_id == ${user.uid}`
      });

      const carouselsSnapshot = await getDocs(carouselsQuery);

      console.log('[Dashboard] Resultado da query:', {
        docs_count: carouselsSnapshot.docs.length,
        empty: carouselsSnapshot.empty,
        size: carouselsSnapshot.size
      });

      const carouselsList: Carousel[] = carouselsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('[Dashboard] Processando documento:', {
          id: doc.id,
          title: data.title,
          user_id: data.user_id,
          layout_type: data.layout_type,
          created_at: data.created_at
        });

        return {
          id: doc.id,
          ...data,
          layout_type: data.layout_type || "instagram_rect",
        } as Carousel;
      });

      // Ordenar no cliente por created_at ou updated_at
      carouselsList.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      console.log('[Dashboard] Carrosséis processados:', {
        total: carouselsList.length,
        published: carouselsList.filter(c => c.published).length,
        drafts: carouselsList.filter(c => !c.published).length
      });

      setCarousels(carouselsList);
      setDebugInfo({
        user_id: user.uid,
        total_carousels: carouselsList.length,
        last_fetch: new Date().toISOString(),
        query_success: true
      });

    } catch (error: any) {
      console.error('[Dashboard] Erro detalhado ao carregar carrosséis:', {
        error: error,
        message: error?.message,
        code: error?.code,
        user_id: user.uid,
        timestamp: new Date().toISOString()
      });

      setDebugInfo({
        user_id: user.uid,
        error: error?.message || 'Erro desconhecido',
        last_fetch: new Date().toISOString(),
        query_success: false
      });

      toast({
        title: "Erro ao carregar carrosséis",
        description: `Detalhes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, [user, navigate, toast]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      console.log('[Dashboard] Iniciando exclusão do carrossel:', id);
      
      const carouselDocRef = doc(db, "carousels", id);
      await deleteDoc(carouselDocRef);

      console.log('[Dashboard] Carrossel excluído com sucesso:', id);
      setCarousels(carousels.filter((carousel) => carousel.id !== id));
      
      toast({
        title: "Carrossel excluído com sucesso"
      });
    } catch (error: any) {
      console.error('[Dashboard] Erro ao excluir carrossel:', {
        carousel_id: id,
        error: error,
        message: error?.message
      });
      
      toast({
        title: "Erro ao excluir carrossel",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDebugInfo = () => (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-medium">Debug Info</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCarousels}
              className="text-gray-400 hover:text-white p-1"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('[DEBUG INFO]', debugInfo)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">User ID:</span>
            <p className="text-white font-mono text-xs">{debugInfo.user_id}</p>
          </div>
          <div>
            <span className="text-gray-400">Total Carrosséis:</span>
            <p className="text-white">{debugInfo.total_carousels || 0}</p>
          </div>
          <div>
            <span className="text-gray-400">Última Busca:</span>
            <p className="text-white text-xs">{debugInfo.last_fetch}</p>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <Badge variant={debugInfo.query_success ? "default" : "destructive"}>
              {debugInfo.query_success ? "Sucesso" : "Erro"}
            </Badge>
          </div>
          {debugInfo.error && (
            <div className="col-span-2">
              <span className="text-gray-400">Erro:</span>
              <p className="text-red-400 text-xs">{debugInfo.error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

          {/* Debug Info */}
          {debugInfo && Object.keys(debugInfo).length > 0 && renderDebugInfo()}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all">
                Todos ({carousels.length})
              </TabsTrigger>
              <TabsTrigger value="published">
                Publicados ({carousels.filter(c => c.published).length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Rascunhos ({carousels.filter(c => !c.published).length})
              </TabsTrigger>
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
