import React, { useEffect, useState } from "react";
import { SimuladoService } from "../../../services/simulado.service";
import { Link } from "react-router-dom";

export default function MeusSimulados() {
  const [simulados, setSimulados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulados();
  }, []);

  const loadSimulados = async () => {
    try {
      const data = await SimuladoService.listMySimulados();
      setSimulados(data);
    } catch (error) {
      console.error("Erro ao carregar simulados:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Meus Simulados
            </h1>
            <p className="text-slate-400">
              Histórico de provas geradas pela IA.
            </p>
          </div>
          <Link
            to="/simulados/gerar"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            + Novo Simulado
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-800/30 animate-pulse rounded-3xl border border-slate-700/50"
              ></div>
            ))}
          </div>
        ) : simulados.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50">
            <p className="text-slate-500 mb-4">
              Você ainda não gerou nenhum simulado.
            </p>
            <Link
              to="/simulados/gerar"
              className="text-blue-400 hover:underline"
            >
              Começar agora ✨
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulados.map((simulados) => (
              <div
                key={simulados._id}
                className="group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/60 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg
                    className="w-20 h-20 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 truncate pr-8">
                  {simulados.nome}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-lg border border-blue-500/20">
                    {simulados.materia || "Misto"}
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-lg border border-indigo-500/20 uppercase">
                    {simulados.dificuldade}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <span className="text-slate-500 text-sm">
                    {simulados.quantidadeQuestoes} questões
                  </span>
                  <Link
                    to={`/simulados/${simulados._id}`}
                    className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    Abrir{" "}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
