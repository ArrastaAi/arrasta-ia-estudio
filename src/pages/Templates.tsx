
import MainLayout from "@/components/layout/MainLayout";
import TemplateGallery from "@/components/templates/TemplateGallery";
import { useNavigate } from "react-router-dom";
import { Template } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

const Templates = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectTemplate = async (template: Template) => {
    if (!user) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para usar este template",
      });
      navigate("/auth");
      return;
    }

    toast({
      title: "Template selecionado",
      description: `Você selecionou o template: ${template.title}`,
    });
    
    // Aqui você pode implementar a lógica para iniciar um novo carrossel com o template
    navigate("/create");
  };

  return (
    <MainLayout>
      <div className="bg-gray-900 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">
              Galeria de Templates
            </h1>
            <p className="text-gray-400">
              Escolha um template para começar seu carrossel
            </p>
          </div>

          <TemplateGallery onSelectTemplate={handleSelectTemplate} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Templates;
