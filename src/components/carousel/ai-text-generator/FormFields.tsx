
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface FormProps {
  formData: {
    prompt: string;
    topic: string;
    audience: string;
    goal: string;
    content: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (value: React.SetStateAction<{
    prompt: string;
    topic: string;
    audience: string;
    goal: string;
    content: string;
  }>) => void;
}

export const YuriFormFields = ({ formData, handleInputChange, setFormData }: FormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="topic" className="text-white">Tema do Texto</Label>
        <Input
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleInputChange}
          placeholder="Ex: Marketing Digital, Vendas Online, Fitness"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="audience" className="text-white">Público-alvo</Label>
        <Input
          id="audience"
          name="audience"
          value={formData.audience}
          onChange={handleInputChange}
          placeholder="Ex: Empreendedores, Profissionais de Marketing, Estudantes"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="goal" className="text-white">Objetivo</Label>
        <RadioGroup 
          defaultValue="educar" 
          name="goal"
          value={formData.goal}
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, goal: value }))
          }
          className="flex flex-wrap gap-3 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="educar" id="educar" className="border-white text-white" />
            <Label htmlFor="educar" className="text-white">Educar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vender" id="vender" className="border-white text-white" />
            <Label htmlFor="vender" className="text-white">Vender</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="engajar" id="engajar" className="border-white text-white" />
            <Label htmlFor="engajar" className="text-white">Engajar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inspirar" id="inspirar" className="border-white text-white" />
            <Label htmlFor="inspirar" className="text-white">Inspirar</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="prompt" className="text-white">Detalhes adicionais (opcional)</Label>
        <Textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={handleInputChange}
          placeholder="Adicione detalhes específicos para personalizar seu carrossel..."
          className="bg-gray-700 border-gray-600 text-white"
          rows={3}
        />
      </div>
    </div>
  );
};

export const FormatterFields = ({ formData, handleInputChange }: FormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content" className="text-white">Cole seu conteúdo para formatação</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Cole aqui o texto que deseja formatar para um carrossel..."
          className="bg-gray-700 border-gray-600 text-white"
          rows={6}
        />
      </div>
    </div>
  );
};
