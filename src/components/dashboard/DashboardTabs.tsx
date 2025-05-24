
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel } from "@/types/database.types";
import CarouselGrid from "./CarouselGrid";

interface DashboardTabsProps {
  carousels: Carousel[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const DashboardTabs = ({ carousels, loading, onDelete }: DashboardTabsProps) => {
  const publishedCarousels = carousels.filter(c => c.published);
  const draftCarousels = carousels.filter(c => !c.published);

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="all">
          Todos ({carousels.length})
        </TabsTrigger>
        <TabsTrigger value="published">
          Publicados ({publishedCarousels.length})
        </TabsTrigger>
        <TabsTrigger value="drafts">
          Rascunhos ({draftCarousels.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <CarouselGrid 
          carousels={carousels} 
          loading={loading} 
          onDelete={onDelete} 
        />
      </TabsContent>

      <TabsContent value="published">
        <CarouselGrid 
          carousels={publishedCarousels} 
          loading={loading} 
          onDelete={onDelete} 
        />
      </TabsContent>

      <TabsContent value="drafts">
        <CarouselGrid 
          carousels={draftCarousels} 
          loading={loading} 
          onDelete={onDelete} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
