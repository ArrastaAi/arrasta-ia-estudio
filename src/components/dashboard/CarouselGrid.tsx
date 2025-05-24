
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Carousel } from "@/types/database.types";
import CarouselCard from "./CarouselCard";

interface CarouselGridProps {
  carousels: Carousel[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const CarouselGrid = ({ carousels, loading, onDelete }: CarouselGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-700 rounded-md animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (carousels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-gray-800 p-4 rounded-full mb-6">
          <Plus className="h-10 w-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Crie seu primeiro carrossel
        </h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Você ainda não criou nenhum carrossel. Comece agora e impressione seu público! 
          <br />
          <span className="text-sm text-purple-400">Mínimo: 4 slides | Máximo: 9 slides</span>
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {carousels.map((carousel) => (
        <CarouselCard
          key={carousel.id}
          carousel={carousel}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CarouselGrid;
