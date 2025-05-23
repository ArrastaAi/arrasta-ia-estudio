
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Arrasta<span className="text-purple-500">Aí</span>
            </h3>
            <p className="text-gray-300 mb-4">Tu arrasta. A IA cria.</p>
            <p className="text-gray-300">
              Um estúdio de carrosséis com inteligência, alma e propósito.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-purple-400">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-purple-400">
                  Recursos
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-purple-400">
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-purple-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-purple-400">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/tutorials" className="text-gray-300 hover:text-purple-400">
                  Tutoriais
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-purple-400">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-300 hover:text-purple-400">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-300 hover:text-purple-400">
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} ArrastaAí. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-400 hover:text-purple-400">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-purple-400">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
