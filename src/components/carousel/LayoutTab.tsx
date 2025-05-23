
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, Grid3X3, NewspaperIcon, GalleryVertical, Instagram, BookText, Book, BookOpen, Text, Heading } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TextStyleOptions } from "@/types/carousel.types";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayoutStyles } from "./preview/useLayoutStyles";

interface LayoutTabProps {
  layoutType: string;
  onUpdateLayout: (layout: string) => void;
  textStyles?: TextStyleOptions;
  onUpdateTextStyles?: (styles: TextStyleOptions) => void;
}

const LayoutTab: React.FC<LayoutTabProps> = ({ 
  layoutType = "instagram_rect", 
  onUpdateLayout
}) => {
  const { toast } = useToast();
  const [activeLayoutTab, setActiveLayoutTab] = React.useState("social");

  const handleApplyChanges = () => {
    toast({
      title: "Alterações aplicadas",
      description: "As alterações de layout foram aplicadas aos slides."
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Tabs defaultValue="social" value={activeLayoutTab} onValueChange={setActiveLayoutTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="editorial">Editorial</TabsTrigger>
            <TabsTrigger value="books">Livros</TabsTrigger>
          </TabsList>
          
          {/* Conteúdo para a aba de redes sociais */}
          <TabsContent value="social" className="mt-4">
            <Label className="text-white mb-3 block">Formatos para redes sociais</Label>
            <RadioGroup 
              value={layoutType} 
              onValueChange={onUpdateLayout}
              className="grid grid-cols-2 gap-4"
            >
              <LayoutOption 
                id="feed_square" 
                value="feed_square" 
                label="Instagram (Quadrado)"
                currentValue={layoutType}
                icon={
                  <div className="aspect-square w-16 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-500 rounded"></div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="instagram_rect" 
                value="instagram_rect" 
                label="Instagram (Feed)"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-8 h-10 bg-gray-500 rounded"></div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="stories" 
                value="stories" 
                label="Stories"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-6 h-12 bg-gray-500 rounded"></div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="tiktok" 
                value="tiktok" 
                label="TikTok"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gray-600 rounded mb-2 flex items-center justify-center relative">
                    <div className="w-6 h-12 bg-gray-500 rounded"></div>
                    <span className="absolute bottom-1 text-[8px] font-bold">TikTok</span>
                  </div>
                }
              />

              <LayoutOption 
                id="facebook" 
                value="facebook" 
                label="Facebook"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-10 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gray-500 rounded"></div>
                  </div>
                }
              />

              <LayoutOption 
                id="linkedin" 
                value="linkedin" 
                label="LinkedIn"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-8 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gray-500 rounded"></div>
                  </div>
                }
              />

              <LayoutOption 
                id="twitter" 
                value="twitter" 
                label="Twitter"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-10 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gray-500 rounded relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-6 h-6 bg-gray-400 rounded-full translate-x-[-50%] translate-y-[-50%]"></div>
                    </div>
                  </div>
                }
              />

              <LayoutOption 
                id="youtube" 
                value="youtube" 
                label="YouTube"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-10 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gray-500 rounded flex items-center justify-center">
                      <div className="w-3 h-3 border-t-4 border-t-white border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                    </div>
                  </div>
                }
              />
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="media" className="mt-4">
            <Label className="text-white mb-3 block">Formatos para mídia impressa e digital</Label>
            <RadioGroup 
              value={layoutType} 
              onValueChange={onUpdateLayout}
              className="grid grid-cols-2 gap-4"
            >
              <LayoutOption 
                id="newspaper" 
                value="newspaper" 
                label="Jornal"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-12 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-14 h-10 bg-gray-500 rounded grid grid-cols-2 gap-[2px] p-[2px]">
                      <div className="bg-gray-400"></div>
                      <div className="bg-gray-400"></div>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="magazine" 
                value="magazine" 
                label="Revista"
                currentValue={layoutType}
                icon={
                  <div className="w-16 h-12 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-14 h-10 bg-gray-500 rounded grid grid-cols-3 gap-[2px] p-[2px]">
                      <div className="bg-gray-400"></div>
                      <div className="bg-gray-400"></div>
                      <div className="bg-gray-400"></div>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="pinterest" 
                value="pinterest" 
                label="Pinterest"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <div className="w-10 h-14 bg-gray-500 rounded grid grid-cols-2 gap-[2px] p-[2px]">
                      <div className="bg-gray-400 h-6"></div>
                      <div className="bg-gray-400 h-8"></div>
                      <div className="bg-gray-400 h-4"></div>
                      <div className="bg-gray-400 h-3"></div>
                    </div>
                  </div>
                }
              />
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="editorial" className="mt-4">
            <Label className="text-white mb-3 block">Formatos para conteúdo editorial</Label>
            <RadioGroup 
              value={layoutType} 
              onValueChange={onUpdateLayout}
              className="grid grid-cols-2 gap-4"
            >
              <LayoutOption 
                id="editorial" 
                value="editorial" 
                label="Editorial"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-gray-700 rounded mb-2 flex flex-col">
                    <div className="h-3 w-full bg-gray-900 flex items-center justify-start px-1">
                      <span className="text-[6px] text-white">EDITORIAL</span>
                    </div>
                    <div className="flex-1 p-1 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-500"></div>
                    </div>
                    <div className="h-3 w-full bg-gray-600 p-[2px]">
                      <div className="h-[2px] w-2/3 bg-gray-400"></div>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="quote" 
                value="quote" 
                label="Citação"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-gray-800 rounded mb-2 flex flex-col">
                    <div className="h-2 w-full bg-gray-700 flex items-center justify-start px-1">
                      <span className="text-[5px] text-white">CITAÇÃO</span>
                    </div>
                    <div className="flex-1 p-2 flex items-center justify-center">
                      <div className="w-full h-8 bg-gray-700 flex items-center justify-center">
                        <span className="text-[8px] text-gray-300 text-center">Texto de<br/>Citação</span>
                      </div>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="manifesto" 
                value="manifesto" 
                label="Manifesto"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-red-700 rounded mb-2 flex flex-col text-center">
                    <div className="flex-1 p-1 flex flex-col">
                      <span className="text-[6px] text-white font-bold mt-4">TÍTULO<br/>GRANDE</span>
                      <span className="text-[4px] text-white mt-1">Subtítulo ou texto de apoio aqui</span>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="statistics" 
                value="statistics" 
                label="Estatísticas"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-indigo-900 rounded mb-2 flex flex-col">
                    <div className="h-2 w-full bg-blue-800 flex items-center justify-start px-1">
                      <span className="text-[5px] text-white">DADOS</span>
                    </div>
                    <div className="flex-1 p-1 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-white font-bold">20%</span>
                      <span className="text-[5px] text-white mt-1">Estatística</span>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="case_study" 
                value="case_study" 
                label="Estudo de Caso"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-orange-800 rounded mb-2 flex flex-col overflow-hidden">
                    <div className="h-2 w-full bg-orange-600 flex items-center justify-start px-1">
                      <span className="text-[5px] text-white">ESTUDO DE CASO</span>
                    </div>
                    <div className="h-8 bg-gray-400"></div>
                    <div className="flex-grow p-1">
                      <div className="h-[2px] w-10 bg-gray-300 mb-1"></div>
                      <div className="h-[2px] w-8 bg-gray-300"></div>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="long_form" 
                value="long_form" 
                label="Texto Longo"
                currentValue={layoutType}
                icon={
                  <div className="w-12 h-16 bg-gray-800 rounded mb-2 flex flex-col overflow-hidden">
                    <div className="h-2 w-full bg-gray-700 flex items-center justify-start px-1">
                      <span className="text-[5px] text-white">ARTIGO</span>
                    </div>
                    <div className="flex-grow p-1">
                      <div className="h-[2px] w-10 bg-gray-400 mb-1"></div>
                      <div className="h-[2px] w-8 bg-gray-400 mb-2"></div>
                      <div className="h-[2px] w-10 bg-gray-400 mb-1"></div>
                      <div className="h-[2px] w-8 bg-gray-400 mb-2"></div>
                      <div className="h-[2px] w-10 bg-gray-400 mb-1"></div>
                      <div className="h-[2px] w-8 bg-gray-400"></div>
                    </div>
                  </div>
                }
              />
            </RadioGroup>
          </TabsContent>
          
          {/* Nova aba para formatos de livros */}
          <TabsContent value="books" className="mt-4">
            <Label className="text-white mb-3 block">Formatos inspirados em livros best-sellers</Label>
            <RadioGroup 
              value={layoutType} 
              onValueChange={onUpdateLayout}
              className="grid grid-cols-2 gap-4"
            >
              <LayoutOption 
                id="fiction_cover" 
                value="fiction_cover" 
                label="Ficção"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gradient-to-b from-blue-900 to-purple-900 rounded mb-2 flex flex-col justify-end overflow-hidden">
                    <div className="p-1 text-center">
                      <span className="text-[7px] text-white font-bold block">O TÍTULO</span>
                      <span className="text-[5px] text-gray-300 block">AUTOR</span>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="nonfiction_cover" 
                value="nonfiction_cover" 
                label="Não Ficção"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gray-100 rounded mb-2 flex flex-col justify-between overflow-hidden">
                    <div className="p-1 bg-red-700 w-full">
                      <span className="text-[5px] text-white font-bold">BEST-SELLER</span>
                    </div>
                    <div className="p-1 text-center">
                      <span className="text-[7px] text-gray-800 font-bold block">TÍTULO</span>
                      <span className="text-[5px] text-gray-600 block">SUBTÍTULO</span>
                    </div>
                    <div className="p-1 bg-gray-800 w-full">
                      <span className="text-[5px] text-white">AUTOR</span>
                    </div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="memoir" 
                value="memoir" 
                label="Memórias"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gray-700 rounded mb-2 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-gray-500 mb-1"></div>
                    <span className="text-[6px] text-white font-medium block">NOME</span>
                    <span className="text-[4px] text-gray-300 block">Memórias</span>
                  </div>
                }
              />
              
              <LayoutOption 
                id="self_help" 
                value="self_help" 
                label="Autoajuda"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded mb-2 flex flex-col justify-center items-center overflow-hidden">
                    <span className="text-[5px] text-white uppercase block">Como</span>
                    <span className="text-[7px] text-white font-bold block">TÍTULO</span>
                    <span className="text-[5px] text-white block mt-1">em 7 passos</span>
                  </div>
                }
              />
              
              <LayoutOption 
                id="academic" 
                value="academic" 
                label="Acadêmico"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-white rounded mb-2 flex flex-col justify-between overflow-hidden">
                    <div className="h-3 bg-blue-900 w-full"></div>
                    <div className="p-1 text-center">
                      <span className="text-[6px] text-gray-900 font-bold">FUNDAMENTOS</span>
                      <span className="text-[4px] text-gray-700 block">de Ciência</span>
                    </div>
                    <div className="h-1 bg-blue-900 w-full"></div>
                  </div>
                }
              />
              
              <LayoutOption 
                id="thriller" 
                value="thriller" 
                label="Suspense"
                currentValue={layoutType}
                icon={
                  <div className="w-10 h-16 bg-black rounded mb-2 flex flex-col justify-end overflow-hidden">
                    <div className="p-1 text-center">
                      <span className="text-[7px] text-red-600 font-bold block">PERIGO</span>
                      <div className="h-[2px] w-6 bg-red-600 mx-auto mb-1"></div>
                      <span className="text-[5px] text-gray-400 block">AUTOR</span>
                    </div>
                  </div>
                }
              />
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </div>

      <Separator className="border-gray-700 my-4" />

      <div className="flex flex-col space-y-4">
        <h3 className="text-white font-semibold">Pré-visualização do layout:</h3>
        <LayoutPreview layoutType={layoutType} />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleApplyChanges} className="bg-gradient-to-r from-purple-500 to-blue-500">
          Aplicar alterações
        </Button>
      </div>
    </div>
  );
};

// Componente de opção de layout
interface LayoutOptionProps {
  id: string;
  value: string;
  label: string;
  currentValue: string;
  icon: React.ReactNode;
}

const LayoutOption: React.FC<LayoutOptionProps> = ({ id, value, label, currentValue, icon }) => {
  const isSelected = currentValue === value;
  
  return (
    <Card 
      className={`flex items-center space-x-2 p-3 cursor-pointer border 
        ${isSelected ? "border-blue-500 bg-gray-700/50" : "border-gray-700 hover:border-blue-500 hover:bg-gray-700/30"}`}
    >
      <RadioGroupItem value={value} id={id} className="sr-only" />
      <Label htmlFor={id} className="flex flex-col items-center cursor-pointer w-full">
        {icon}
        <span className="text-sm">{label}</span>
      </Label>
    </Card>
  );
};

// Componente de pré-visualização do layout
const LayoutPreview: React.FC<{ layoutType: string }> = ({ layoutType }) => {
  const { getLayoutName, getLayoutDimensions, getGridLayoutClass, getHeaderConfig } = useLayoutStyles(layoutType);
  const headerConfig = getHeaderConfig();
  const isEditorial = ['editorial', 'quote', 'manifesto', 'statistics', 'case_study', 'long_form'].includes(layoutType);
  const isBookLayout = ['fiction_cover', 'nonfiction_cover', 'memoir', 'self_help', 'academic', 'thriller'].includes(layoutType);
  
  // Exemplo de texto para a visualização
  const getSampleText = () => {
    if (layoutType === 'quote') {
      return '"A simplicidade é a sofisticação suprema"';
    } else if (layoutType === 'statistics') {
      return '85% dos usuários preferem interfaces simples e intuitivas';
    } else if (layoutType === 'manifesto') {
      return 'MANIFESTO PELA SIMPLICIDADE DIGITAL';
    } else if (isBookLayout) {
      return layoutType === 'fiction_cover' ? 'O CAMINHO DA JORNADA' : 'COMO TRANSFORMAR IDEIAS EM REALIDADE';
    } else {
      return 'Exemplo de conteúdo para este formato';
    }
  };
  
  return (
    <div className="bg-gray-700 rounded-md p-4">
      <div className="mb-2 text-gray-300 text-sm">
        <span className="font-semibold">Formato:</span> {getLayoutName()}
      </div>
      <div className="flex items-center justify-center">
        <div className={`${getLayoutDimensions()} bg-gray-600 rounded overflow-hidden flex flex-col`}>
          {/* Cabeçalho para formatos editoriais */}
          {headerConfig && !isBookLayout && (
            <div 
              className="w-full py-1 px-2 text-xs font-medium" 
              style={{ backgroundColor: headerConfig.bgColor, color: headerConfig.textColor }}
            >
              {headerConfig.tag}
            </div>
          )}
          
          {/* Grid/Conteúdo */}
          <div className={`${getGridLayoutClass()} flex-1 w-full h-full`}>
            {isEditorial ? (
              // Estrutura para layouts editoriais
              <div className="w-full h-full flex flex-col p-2">
                {layoutType === 'quote' ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-gray-300 text-xs">
                      {getSampleText()}
                    </div>
                  </div>
                ) : layoutType === 'statistics' ? (
                  <div className="flex-1 flex items-center justify-center flex-col">
                    <div className="text-4xl font-bold text-gray-300 mb-2">85%</div>
                    <div className="text-sm text-gray-300">dos usuários</div>
                  </div>
                ) : layoutType === 'manifesto' ? (
                  <div className="flex-1 p-4">
                    <h2 className="text-lg font-bold text-gray-300 mb-3">{getSampleText()}</h2>
                    <p className="text-xs text-gray-400">Texto complementar do manifesto com detalhes</p>
                  </div>
                ) : layoutType === 'long_form' ? (
                  <div className="flex-1 p-3">
                    <h2 className="text-md font-bold text-gray-300 mb-2">Título do Artigo</h2>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-500 w-full"></div>
                      <div className="h-1 bg-gray-500 w-5/6"></div>
                      <div className="h-1 bg-gray-500 w-full"></div>
                      <div className="h-1 bg-gray-500 w-4/6"></div>
                      <div className="h-1 bg-gray-500 w-full"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Layouts padrão editorial e case_study */}
                    {layoutType === 'case_study' && (
                      <div className="h-1/2 bg-gray-500 mb-2"></div>
                    )}
                    <div className="flex-1 flex flex-col justify-end p-2">
                      <h2 className="text-sm font-bold text-gray-300 mb-2">{getSampleText()}</h2>
                      <p className="text-xs text-gray-400">Texto complementar</p>
                    </div>
                  </>
                )}
              </div>
            ) : isBookLayout ? (
              // Layouts para formatos de livros
              <div className="w-full h-full flex items-center justify-center">
                {layoutType === 'fiction_cover' ? (
                  <div className="w-full h-full bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col justify-end p-4">
                    <h2 className="text-xl font-bold text-white mb-1 text-center">{getSampleText()}</h2>
                    <p className="text-sm text-gray-300 text-center">AUTOR</p>
                  </div>
                ) : layoutType === 'nonfiction_cover' ? (
                  <div className="w-full h-full bg-gray-100 flex flex-col justify-between">
                    <div className="bg-red-700 p-2 text-white font-bold">
                      NEW YORK TIMES BEST-SELLER
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{getSampleText()}</h2>
                      <p className="text-sm text-gray-600 text-center">Subtítulo Explicativo</p>
                    </div>
                    <div className="bg-gray-800 p-2 text-white text-center">
                      NOME DO AUTOR
                    </div>
                  </div>
                ) : layoutType === 'memoir' ? (
                  <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center p-4">
                    <div className="w-24 h-24 rounded-full bg-gray-500 mb-4"></div>
                    <h2 className="text-xl font-bold text-white mb-1 text-center">NOME</h2>
                    <p className="text-sm text-gray-300 text-center">Uma Autobiografia</p>
                  </div>
                ) : layoutType === 'self_help' ? (
                  <div className="w-full h-full bg-gradient-to-r from-orange-500 to-yellow-500 flex flex-col items-center justify-center p-4">
                    <p className="text-sm text-white uppercase mb-2">Como</p>
                    <h2 className="text-2xl font-bold text-white mb-3 text-center">{getSampleText()}</h2>
                    <p className="text-sm text-white text-center">em apenas 7 passos simples</p>
                  </div>
                ) : layoutType === 'academic' ? (
                  <div className="w-full h-full bg-white flex flex-col">
                    <div className="h-12 bg-blue-900 w-full"></div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">FUNDAMENTOS</h2>
                      <p className="text-sm text-gray-700 text-center">de Ciência Aplicada</p>
                    </div>
                    <div className="h-6 bg-blue-900 w-full"></div>
                  </div>
                ) : layoutType === 'thriller' ? (
                  <div className="w-full h-full bg-black flex flex-col items-center justify-end p-5">
                    <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">O PERIGO OCULTO</h2>
                    <div className="h-1 w-32 bg-red-600 mb-4"></div>
                    <p className="text-sm text-gray-400 text-center">AUTOR BESTSELLER</p>
                  </div>
                ) : (
                  // Layout de livro padrão
                  <span className="text-gray-300 text-xs">Formato de livro</span>
                )}
              </div>
            ) : getGridLayoutClass() ? (
              // Layouts com grid pré-existentes
              <>
                <div className="bg-gray-500 w-full h-full min-h-16 flex items-center justify-center">
                  <p className="text-sm text-gray-800">{getSampleText()}</p>
                </div>
                <div className="bg-gray-500 w-full h-full min-h-16"></div>
                {layoutType === "magazine" && <div className="bg-gray-500 w-full h-full min-h-16"></div>}
                {(layoutType === "twitter") && (
                  <>
                    <div className="bg-gray-500 w-full h-full min-h-16"></div>
                    <div className="bg-gray-500 w-full h-full min-h-16"></div>
                  </>
                )}
              </>
            ) : (
              // Layouts sem grid específico
              <div className="bg-gray-500 w-full h-full flex items-center justify-center">
                <div className="flex-1 p-4 text-center">
                  <span className="text-gray-300 text-md">{getSampleText()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutTab;
