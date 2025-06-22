
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Tu arrasta.{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                  A IA cria.
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Um estúdio de carrosséis com inteligência, alma e propósito. Transforme suas
                ideias em conteúdo visual impactante em minutos.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-lg px-8 py-6"
                >
                  <Link to="/auth">Começar Grátis</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-purple-500 text-purple-500 text-lg px-8 py-6"
                >
                  <Link to="/features">Como Funciona</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                  alt="ArrastaAí App"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Crie carrosséis de alto impacto
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Sem conhecimento técnico necessário. Apenas arraste, edite e publique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="h-12 w-12 bg-purple-500/20 flex items-center justify-center rounded-lg mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Upload & Estrutura Visual
              </h3>
              <p className="text-gray-400">
                Upload de até 20 imagens ou escolha entre nossa biblioteca de fundos temáticos com
                filtros e efeitos personalizáveis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="h-12 w-12 bg-blue-500/20 flex items-center justify-center rounded-lg mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                IA de Texto Integrada
              </h3>
              <p className="text-gray-400">
                Nossa IA distribui automaticamente seu conteúdo entre os slides de forma coesa
                com base no layout e estilo narrativo escolhido.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="h-12 w-12 bg-pink-500/20 flex items-center justify-center rounded-lg mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Layouts Inteligentes
              </h3>
              <p className="text-gray-400">
                Galeria de layouts criativos para cada formato de rede social que ajusta texto e
                imagem automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para criar carrosséis que{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              se destacam?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Transforme suas ideias em conteúdo visual de alto impacto em questão de minutos.
            Sem conhecimento técnico, sem complicações.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-lg px-8 py-6"
          >
            <Link to="/auth">Comece Agora - É Grátis</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
