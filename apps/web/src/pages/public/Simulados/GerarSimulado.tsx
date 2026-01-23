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
      navigate(`/simulados/${result._id}`);
    } catch (error) {
      handleError(error, "Erro ao gerar seu simulado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <AutoAwesome className="text-sm" />
            <span>Inteligência Artificial Ativa</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
              Crie seu Simulado
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Nossa IA analisa milhares de questões para criar o exame perfeito
            para o seu nível.
          </p>
        </div>

        {/* glass-card is a custom utility idea, but we use pure tailwind here */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />

          <form onSubmit={handleGenerate} className="space-y-10 relative">
            {/* Input Nome */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                <School className="text-blue-500 text-sm" />
                Nome do Simulado
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maratona de Matemática - ENEM"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Grid for selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <Psychology className="text-indigo-400 text-sm" />
                  Matéria Alvo
                </label>
                <div className="relative">
                  <select
                    value={materia}
                    onChange={(e) => setMateria(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">
                      ✨ Todas as Matérias
                    </option>
                    <option value="Matemática" className="bg-slate-900">
                      Matemática
                    </option>
                    <option value="Física" className="bg-slate-900">
                      Física
                    </option>
                    <option value="Química" className="bg-slate-900">
                      Química
                    </option>
                    <option value="Biologia" className="bg-slate-900">
                      Biologia
                    </option>
                    <option value="Português" className="bg-slate-900">
                      Português
                    </option>
                    <option value="História" className="bg-slate-900">
                      História
                    </option>
                    <option value="Geografia" className="bg-slate-900">
                      Geografia
                    </option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ArrowForward className="rotate-90 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <AutoAwesome className="text-amber-400 text-sm" />
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
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="misto" className="bg-slate-900">
                      🌊 Misto / Equilibrado
                    </option>
                    <option value="facil" className="bg-slate-900">
                      🟢 Fácil / Base
                    </option>
                    <option value="medio" className="bg-slate-900">
                      🟡 Médio / Desafio
                    </option>
                    <option value="dificil" className="bg-slate-900">
                      🔴 Difícil / Elite
                    </option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ArrowForward className="rotate-90 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <FormatListNumbered className="text-emerald-400 text-sm" />
                  Volume de Questões
                </label>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-lg font-bold border border-emerald-500/20">
                  {quantidade}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>Rápido (5)</span>
                <span>Padrão (25)</span>
                <span>Completo (50)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group/btn w-full py-5 rounded-[1.5rem] font-bold text-xl text-white transition-all transform active:scale-[0.98] shadow-2xl relative overflow-hidden ${
                loading
                  ? "bg-slate-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Sintonizando IA...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Gerar Simulado</span>
                  <ArrowForward className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              )}
              {/* Radial gradient overlay on hover */}
              {!loading && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>O simulado será gerado instantaneamente na sua dashboard.</p>
        </div>
      </div>
    </div>
  );
}
