import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SimuladoService } from "../../../services/simulado.service";

export default function VisualizarSimulado() {
  const { id } = useParams<{ id: string }>();
  const [simulado, setSimulado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadSimulado(id);
  }, [id]);

  const loadSimulado = async (simuladoId: string) => {
    try {
      const data = await SimuladoService.getById(simuladoId);
      setSimulado(data);
    } catch (error) {
      console.error("Erro ao carregar simulado:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!simulado)
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-bold">
        <p>Simulado não encontrado.</p>
        <Link to="/simulados" className="mt-4 text-blue-400 hover:underline">
          Voltar para meus simulados
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-800 z-50">
        <div
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
          style={{ width: "0%" }}
        ></div>
      </div>

      <header className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-700/50 p-6 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold truncate pr-4">{simulado.nome}</h1>
            <p className="text-slate-500 text-sm">
              {simulado.quantidadeQuestoes} questões •{" "}
              {simulado.materia || "Geral"}
            </p>
          </div>
          <Link
            to="/simulados"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Sair
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        {simulado.questoes.map((questao: any, index: number) => (
          <div
            key={questao._id}
            className="group bg-slate-800/30 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                {index + 1}
              </span>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed">{questao.enunciado}</p>
              </div>
            </div>

            <div className="space-y-3 ml-14">
              {questao.alternativas.map(
                (alternativa: string, altIndex: number) => (
                  <button
                    key={altIndex}
                    className="w-full text-left p-4 rounded-xl border border-slate-700/50 bg-slate-900/40 hover:bg-slate-700/30 hover:border-slate-500 transition-all flex items-start gap-3 group/btn"
                  >
                    <span className="text-slate-500 group-hover/btn:text-blue-400 font-semibold">
                      {String.fromCharCode(65 + altIndex)})
                    </span>
                    <span className="text-slate-300">{alternativa}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}

        <div className="py-20 text-center">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95">
            Finalizar Simulado ✅
          </button>
        </div>
      </main>
    </div>
  );
}
