import React, { useState } from "react";
import { SimuladoService } from "../../../services/simulado.service";
import { useNavigate } from "react-router-dom";

export default function GerarSimulado() {
  const [nome, setNome] = useState("");
  const [materia, setMateria] = useState("");
  const [dificuldade, setDificuldade] = useState<
    "facil" | "medio" | "dificil" | "misto"
  >("misto");
  const [quantidade, setQuantidade] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    } catch (error: unknown) {
      alert("Erro ao gerar simulado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
            Gerador de Simulados IA
          </h1>
          <p className="text-slate-400">
            Configure seu exame personalizado e deixe nossa IA selecionar as
            melhores questões.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Simulado
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Simulado de Revisão - Matemática"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Matéria (Opcional)
                </label>
                <select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Todas</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Física">Física</option>
                  <option value="Química">Química</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Português">Português</option>
                  <option value="História">História</option>
                  <option value="Geografia">Geografia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dificuldade
                </label>
                <select
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value as any)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="misto">Misto</option>
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantidade de Questões:{" "}
                <span className="text-blue-400 font-bold">{quantidade}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 ${
                loading
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  IA Gerando Simulados...
                </span>
              ) : (
                "Gerar Simulado Agora ✨"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
