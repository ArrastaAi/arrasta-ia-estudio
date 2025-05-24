
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, Trash2, Layout, Calendar } from "lucide-react";
import { Carousel } from "@/types/database.types";
import { formatSafeDate, getLayoutAspectRatio, getLayoutDisplayName } from "@/utils/carouselUtils";

interface CarouselCardProps {
  carousel: Carousel;
  onDelete: (id: string) => void;
}

const CarouselCard = ({ carousel, onDelete }: CarouselCardProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
      <CardHeader className="p-0">
        <div className={`${getLayoutAspectRatio(carousel.layout_type)} bg-gray-700 relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-center p-4">
            <div>
              <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{getLayoutDisplayName(carousel.layout_type)}</p>
            </div>
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
        <p className="text-gray-400 line-clamp-2 mb-3">
          {carousel.description || "Sem descrição"}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{formatSafeDate(carousel.updated_at || carousel.created_at)}</span>
        </div>
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
          onClick={() => onDelete(carousel.id)}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarouselCard;
