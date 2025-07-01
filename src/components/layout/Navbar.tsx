
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Plus, LogOut, Settings, User, BellDot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const showNotification = () => {
    toast({
      title: "Nova notificação",
      description: "Você tem uma nova mensagem no sistema",
      variant: "default",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-black text-white py-4 px-6 sticky top-0 z-30">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link to="/" className="font-bold text-2xl">
            Arrasta<span className="text-purple-500">Aí</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={showNotification}
                className="relative"
              >
                <BellDot className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></span>
              </Button>
              <Link to="/dashboard" className="hover:text-purple-400 transition">
                Dashboard
              </Link>
              <Link to="/templates" className="hover:text-purple-400 transition">
                Templates
              </Link>
              <Link to="/inspirations" className="hover:text-purple-400 transition">
                Inspirações
              </Link>
              <Button asChild variant="gradient">
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" /> Criar Carrossel
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border-2 border-purple-500">
                    <AvatarImage src={user.user_metadata?.picture || user.user_metadata?.avatar_url} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/features" className="hover:text-purple-400 transition">
                Recursos
              </Link>
              <Link to="/pricing" className="hover:text-purple-400 transition">
                Preços
              </Link>
              <Button asChild variant="outline" className="border-purple-500 text-purple-500">
                <Link to="/auth">Entrar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-3 px-2 pb-4">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                onClick={showNotification}
                className="flex items-center w-full py-2 px-4 hover:bg-gray-800 rounded justify-start"
              >
                <BellDot className="mr-2 h-4 w-4" />
                Notificações
                <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
              </Button>
              <Link
                to="/dashboard"
                className="block py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/templates"
                className="block py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                Templates
              </Link>
              <Link
                to="/inspirations"
                className="block py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                Inspirações
              </Link>
              <Link
                to="/create"
                className="block py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded"
                onClick={toggleMobileMenu}
              >
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" /> Criar Carrossel
                </div>
              </Link>
              <hr className="border-gray-700 my-2" />
              <div className="py-2 px-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.picture || user.user_metadata?.avatar_url} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.user_metadata?.username || user.email}</p>
                  </div>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center w-full py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </Link>
              <button
                className="flex items-center w-full py-2 px-4 hover:bg-gray-800 rounded"
                onClick={() => {
                  handleSignOut();
                  toggleMobileMenu();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/features"
                className="block py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                Recursos
              </Link>
              <Link
                to="/pricing"
                className="block py-2 px-4 hover:bg-gray-800 rounded"
                onClick={toggleMobileMenu}
              >
                Preços
              </Link>
              <Link
                to="/auth"
                className="block py-2 px-4 border border-purple-500 text-purple-500 rounded text-center"
                onClick={toggleMobileMenu}
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
