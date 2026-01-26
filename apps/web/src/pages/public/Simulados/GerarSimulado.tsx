import React, { useState } from "react";
import { SimuladoService } from "../../../services/simulado.service";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import {
  AutoAwesome,
  School,
  FormatListNumbered,
  Psychology,
  ArrowForward,
} from "@mui/icons-material";

export default function GerarSimulado() {
  const [nome, setNome] = useState("");
  const [materia, setMateria] = useState("");
  const [dificuldade, setDificuldade] = useState<
    "facil" | "medio" | "dificil" | "misto"
  >("misto");
  const [quantidade, setQuantidade] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await SimuladoService.generate({
        nome,
        materia,
        dificuldade,
        quantidade,
      });
      navigate(`/aluno/simulados/${result._id}`);
    } catch (error) {
      handleError(error, "Erro ao gerar seu simulado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full z-10 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 shadow-xl shadow-blue-500/5">
            <AutoAwesome className="text-lg" />
            <span className="tracking-wide">Inteligência Artificial Ativa</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-blue-50 to-slate-400 bg-clip-text text-transparent">
              Crie seu Simulado
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Nossa IA analisa milhares de questões para orquestrar o exame ideal
            para sua evolução.
          </p>
        </div>

        {/* glass-card */}
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800/50 rounded-[3rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 border border-white/[0.03] rounded-[3rem] pointer-events-none" />

          <form onSubmit={handleGenerate} className="space-y-12 relative">
            {/* Input Nome */}
            <div className="space-y-5">
              <label className="flex items-center gap-3 text-base font-bold text-slate-300 ml-2">
                <School className="text-blue-400 text-2xl" />
                Nome do Simulado
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maratona de Matemática - ENEM"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-8 py-5 text-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Grid for selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <label className="flex items-center gap-3 text-base font-bold text-slate-300 ml-2">
                  <Psychology className="text-indigo-400 text-2xl" />
                  Matéria Alvo
                </label>
                <div className="relative">
                  <select
                    value={materia}
                    onChange={(e) => setMateria(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-8 py-5 text-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-slate-950">
                      ✨ Todas as Matérias
                    </option>
                    <option value="Matemática" className="bg-slate-950">
                      Matemática
                    </option>
                    <option value="Física" className="bg-slate-950">
                      Física
                    </option>
                    <option value="Química" className="bg-slate-950">
                      Química
                    </option>
                    <option value="Biologia" className="bg-slate-950">
                      Biologia
                    </option>
                    <option value="Português" className="bg-slate-950">
                      Português
                    </option>
                    <option value="História" className="bg-slate-950">
                      História
                    </option>
                    <option value="Geografia" className="bg-slate-950">
                      Geografia
                    </option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <ArrowForward className="rotate-90 text-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <label className="flex items-center gap-3 text-base font-bold text-slate-300 ml-2">
                  <AutoAwesome className="text-amber-400 text-2xl" />
                  Dificuldade
                </label>
                <div className="relative">
                  <select
                    value={dificuldade}
                    onChange={(e) =>
                      setDificuldade(
                        e.target.value as
                          | "facil"
                          | "medio"
                          | "dificil"
                          | "misto",
                      )
                    }
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-8 py-5 text-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="misto" className="bg-slate-950">
                      🌊 Misto / Equilibrado
                    </option>
                    <option value="facil" className="bg-slate-950">
                      🟢 Fácil / Base
                    </option>
                    <option value="medio" className="bg-slate-950">
                      🟡 Médio / Desafio
                    </option>
                    <option value="dificil" className="bg-slate-950">
                      🔴 Difícil / Elite
                    </option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <ArrowForward className="rotate-90 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Section */}
            <div className="space-y-8">
              <div className="flex justify-between items-center ml-2">
                <label className="flex items-center gap-3 text-base font-bold text-slate-300">
                  <FormatListNumbered className="text-emerald-400 text-2xl" />
                  Volume de Questões
                </label>
                <span className="bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-2xl text-2xl font-black border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  {quantidade}
                </span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all shadow-inner"
                />
                <div className="flex justify-between text-xs font-bold text-slate-600 px-1 mt-4 uppercase tracking-widest">
                  <span>Expresso (5)</span>
                  <span>Padrão (25)</span>
                  <span>Extenso (50)</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group/btn w-full py-6 rounded-3xl font-black text-2xl text-white transition-all transform active:scale-[0.97] shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden ${
                loading
                  ? "bg-slate-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:shadow-blue-500/30"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-4">
                  <div className="w-7 h-7 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="tracking-tight">Sintonizando IA...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-4">
                  <span>Gerar Simulado Agora</span>
                  <ArrowForward className="text-2xl group-hover/btn:translate-x-2 transition-transform duration-300" />
                </span>
              )}
              {/* Animation Layer */}
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-slate-500 text-sm font-medium tracking-wide">
          <p>
            O simulado será orquestrado instantaneamente e ficará disponível em
            sua dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
