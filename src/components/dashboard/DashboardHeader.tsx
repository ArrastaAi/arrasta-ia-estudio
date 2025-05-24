
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meus Carrosséis</h1>
        <p className="text-gray-400">
          Gerencie e edite seus carrosséis ou crie novos (mínimo 4 slides, máximo 9)
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
  );
};

export default DashboardHeader;
