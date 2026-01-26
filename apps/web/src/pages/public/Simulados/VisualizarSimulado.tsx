import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { SimuladoService } from "../../../services/simulado.service";
import type { ISimulado, IQuestion } from "../../../types/simulado";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  ArrowBack,
  CheckCircle,
  Flag,
  HelpOutline,
  AutoAwesome,
} from "@mui/icons-material";

export default function VisualizarSimulado() {
  const { id } = useParams<{ id: string }>();
  const [simulado, setSimulado] = useState<ISimulado | null>(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [scrolled, setScrolled] = useState(0);
  const { handleError } = useErrorHandler();

  const loadSimulado = useCallback(
    async (simuladoId: string) => {
      try {
        const data = await SimuladoService.getById(simuladoId);
        setSimulado(data);
      } catch (error) {
        handleError(error, "Erro ao carregar simulado.");
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  useEffect(() => {
    if (id) loadSimulado(id);
  }, [id, loadSimulado]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrolled((totalScroll / windowHeight) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectAnswer = (questionId: string, index: number) => {
    setRespostas((prev) => ({ ...prev, [questionId]: index }));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-b-indigo-500 rounded-full animate-spin-reverse"></div>
          </div>
        </div>
      </div>
    );

  if (!simulado)
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800">
          <HelpOutline className="text-4xl text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Simulado não encontrado</h2>
        <Link
          to="/aluno/simulados"
          className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <ArrowBack /> Voltar para a Dashboard
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Scroll Progress Bar - Premium Gradient */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-950 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300"
          style={{ width: `${scrolled}%` }}
        ></div>
      </div>

      <header className="sticky top-0 bg-[#020617]/80 backdrop-blur-2xl border-b border-slate-800/50 p-4 md:p-6 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/aluno/simulados"
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowBack />
            </Link>
            <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />
            <div>
              <h1 className="text-lg md:text-xl font-black text-white truncate max-w-[200px] md:max-w-md">
                {simulado.nome}
              </h1>
              <div className="flex items-center gap-4 text-slate-500 text-xs font-black uppercase tracking-widest">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                  {simulado.materia || "Misto"}
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-blue-400">
                  {Object.keys(respostas).length} /{" "}
                  {simulado.quantidadeQuestoes} respondidas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">
              <Flag className="text-sm" />
              Revisar
            </button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Finalizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-12 space-y-16">
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-2">
              Instruções da IA
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Este simulado foi balanceado com base na dificuldade selecionada.
              Leia cada questão atentamente. Ao terminar, clique em finalizar
              para processar seu desempenho.
            </p>
          </div>
          <AutoAwesome className="absolute top-10 right-10 text-blue-500/10 text-[8rem] pointer-events-none" />
        </div>

        {(simulado.questoes as IQuestion[]).map((questao, index) => {
          const respondida = respostas[questao._id] !== undefined;
          return (
            <div
              key={questao._id}
              className={`group bg-slate-900/40 backdrop-blur-xl border transition-all duration-500 rounded-[2.5rem] p-6 md:p-10 hover:bg-slate-900/60 ${
                respondida ? "border-emerald-500/30" : "border-slate-800/50"
              }`}
            >
              <div className="flex items-start gap-4 md:gap-8 mb-10">
                <div className="flex flex-col items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all shadow-lg ${
                      respondida
                        ? "bg-emerald-500 text-white shadow-emerald-500/30"
                        : "bg-slate-800 text-slate-500 shadow-black/20"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {respondida && (
                    <CheckCircle className="text-emerald-500 text-base animate-in zoom-in" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-xl md:text-2xl font-bold leading-relaxed text-slate-100 tracking-tight">
                      {questao.enunciado}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:ml-20">
                {questao.alternativas.map((alternativa, altIndex) => {
                  const isSelected = respostas[questao._id] === altIndex;
                  return (
                    <button
                      key={altIndex}
                      onClick={() => selectAnswer(questao._id, altIndex)}
                      className={`w-full text-left p-5 md:p-6 rounded-2xl border transition-all flex items-start gap-4 group/btn relative overflow-hidden ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/50"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/30"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${
                          isSelected
                            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + altIndex)}
                      </span>
                      <span className="text-lg md:text-xl font-medium leading-relaxed">
                        {alternativa}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action Bar */}
        <div className="pt-20 pb-32 flex flex-col items-center gap-8">
          <div className="h-[2px] w-20 bg-slate-800 rounded-full" />
          <div className="text-center space-y-4">
            <h3 className="text-white font-bold text-xl">Fim das Questões</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              Revise suas respostas antes de enviar para correção definitiva.
            </p>
          </div>
          <button className="group relative bg-emerald-600 hover:bg-emerald-500 text-white px-16 py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              Finalizar Simulado
              <CheckCircle />
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </main>
    </div>
  );
}
