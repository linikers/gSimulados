import { useEffect, useState, useCallback } from "react";
import React from "react";
import { SimuladoService } from "../../../services/simulado.service";
import { Link } from "react-router-dom";
import type { ISimulado } from "../../../types/simulado";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  AutoAwesome,
  Add,
  ArrowForward,
  History,
  School,
  Timer,
  BarChart,
} from "@mui/icons-material";

export default function MeusSimulados() {
  const [simulados, setSimulados] = useState<ISimulado[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const loadSimulados = useCallback(async () => {
    try {
      const data = await SimuladoService.listMySimulados();
      setSimulados(data);
    } catch (error) {
      handleError(error, "Erro ao carregar seus simulados.");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadSimulados();
  }, [loadSimulados]);

  // Helper to get subject colors/icons
  const getSubjectMeta = (subject: string) => {
    const s = (subject || "").toLowerCase();
    if (s.includes("mat")) return { color: "blue", icon: <BarChart /> };
    if (s.includes("fis")) return { color: "indigo", icon: <AutoAwesome /> };
    if (s.includes("qui")) return { color: "emerald", icon: <AutoAwesome /> };
    if (s.includes("bio")) return { color: "rose", icon: <School /> };
    return { color: "slate", icon: <School /> };
  };

  const getDifficultyColor = (diff: string) => {
    const d = (diff || "").toLowerCase();
    if (d === "facil")
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (d === "medio")
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (d === "dificil")
      return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest">
              <History className="text-sm" />
              <span>Sua Jornada</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Meus{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Simulados
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Gerencie e revise todos os seus exames personalizados por IA.
            </p>
          </div>

          <Link
            to="/aluno/simulados/gerar"
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
          >
            <Add className="text-xl" />
            <span>Gerar Novo</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-900/40 backdrop-blur-md animate-pulse rounded-[2rem] border border-slate-800/50"
              />
            ))}
          </div>
        ) : simulados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-slate-800/50 text-center px-6">
            <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-8 text-slate-500">
              <AutoAwesome className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Nenhum simulado ainda
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
              Dê o primeiro passo na sua preparação. Use nossa IA para gerar um
              conjunto de questões focado no que você precisa.
            </p>
            <Link
              to="/aluno/simulados/gerar"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2 group"
            >
              Começar minha primeira prova
              <ArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {simulados.map((s: ISimulado) => {
              const meta = getSubjectMeta(s.materia || "");
              return (
                <Link
                  key={s._id}
                  to={`/aluno/simulados/${s._id}`}
                  className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 hover:bg-slate-800/40 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Subject Icon Background */}
                  <div
                    className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-${meta.color}-500 transform group-hover:scale-110 transition-transform`}
                  >
                    {React.isValidElement(meta.icon) &&
                      React.cloneElement(
                        meta.icon as React.ReactElement,
                        {
                          sx: { width: "8rem", height: "8rem" },
                        } as unknown as React.SVGAttributes<SVGSVGElement>,
                      )}
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getDifficultyColor(s.dificuldade)}`}
                      >
                        {s.dificuldade}
                      </span>
                      <div className="text-slate-500">
                        <Timer className="text-sm" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {s.nome}
                    </h3>

                    <div className="flex items-center gap-3 text-slate-400 mb-10 border-b border-slate-800/50 pb-8">
                      <div
                        className={`w-3 h-3 rounded-full bg-${meta.color}-500 shadow-lg shadow-${meta.color}-500/20`}
                      />
                      <span className="text-base font-semibold tracking-wide">
                        {s.materia || "Misto"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-white font-black text-xl leading-none">
                          {s.quantidadeQuestoes}
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                          Questões
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-blue-400 font-bold group-hover:gap-4 transition-all">
                        <span className="text-lg">Iniciar</span>
                        <ArrowForward className="text-xl" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
