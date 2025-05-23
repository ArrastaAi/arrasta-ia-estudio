
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Type } from "lucide-react";
import LayoutTab from "./LayoutTab";
import TextStylesTab from "./TextStylesTab";
import { TextStyleOptions } from "@/types/carousel.types";

interface StylesTabContainerProps {
  layoutType: string;
  onUpdateLayout: (layout: string) => void;
  textStyles?: TextStyleOptions;
  onUpdateTextStyles?: (styles: TextStyleOptions) => void;
}

const StylesTabContainer: React.FC<StylesTabContainerProps> = ({
  layoutType,
  onUpdateLayout,
  textStyles,
  onUpdateTextStyles
}) => {
  const [activeTab, setActiveTab] = useState("template");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-gray-700">
          <TabsTrigger value="template" className="data-[state=active]:bg-gray-600">
            <Layout className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-gray-600">
            <Type className="h-4 w-4 mr-2" />
            Estilo de texto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="pt-4">
          <LayoutTab 
            layoutType={layoutType} 
            onUpdateLayout={onUpdateLayout}
          />
        </TabsContent>
        
        <TabsContent value="text" className="pt-4">
          <TextStylesTab 
            textStyles={textStyles} 
            onUpdateTextStyles={onUpdateTextStyles} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StylesTabContainer;
