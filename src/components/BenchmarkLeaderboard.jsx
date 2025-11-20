import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import OpenAILogo from '../logos/openai.svg';
import ClaudeLogo from '../logos/claude-color.svg';
import GeminiLogo from '../logos/gemini-color.svg';

const COMPANY_LOGOS = {
  'OpenAI': <img src={OpenAILogo} alt="OpenAI" className="w-full h-full" />,
  'Google': <img src={GeminiLogo} alt="Google Gemini" className="w-full h-full" />,
  'Anthropic': <img src={ClaudeLogo} alt="Anthropic Claude" className="w-full h-full" />,
  'Human': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  ),
  'Baseline': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

const BENCHMARK_DATA = [
  { rank: 1, model: 'Human Baseline', company: 'Human', pass1: 80.0, isBaseline: true },
  { rank: 2, model: 'Gemini 3.0 Pro Preview', company: 'Google', pass1: 9.55 },
  { rank: 3, model: 'GPT-5.1 (High Reasoning)', company: 'OpenAI', pass1: 7.51 },
  { rank: 4, model: 'Random Guessing', company: 'Baseline', pass1: 5.0, isBaseline: true },
];

export default function BenchmarkLeaderboard() {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-6 relative">
      
      {/* Methodology Modal Overlay */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 relative">
             <button 
               onClick={() => setShowMethodology(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
             >
               <X size={20} />
             </button>
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <Info size={18} /> Methodology
             </h3>
             <p className="text-gray-600 leading-relaxed text-sm mb-4">
               Models are evaluated on 50 total problems: 25 3D mental rotation tasks (Shepard-Metzler style with 4 multiple-choice options) and 25 2D path tracing tasks (with 20 possible numeric endpoints).
             </p>
             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
               <p className="text-sm text-gray-700 font-medium mb-2">Probability Equivalence Scoring</p>
               <p className="text-xs text-gray-600 leading-relaxed">
                 Since 3D questions (1/4 chance) are easier to guess than 2D questions (1/20 chance), we normalize difficulty by raising the 3D score to the power of 2.16. The final score is the average of the raw 2D score and the adjusted 3D score. This ensures random guessing yields exactly 5% across both sections.
               </p>
             </div>
             <p className="text-xs text-gray-500">
               <strong>Formula:</strong> Final = (S<sub>2D</sub> + S<sub>3D</sub><sup>2.16</sup>) / 2
             </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Spatial Reasoning Benchmark</h2>
          <p className="text-gray-500 text-sm mt-1">Evaluating multimodal model performance on complex 3D and 2D spatial tasks.</p>
        </div>
        <div>
          <button 
            onClick={() => setShowMethodology(true)}
            className="text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
          >
            Methodology
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3 w-16 text-center">#</th>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3 w-1/2">Pass@1 (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {BENCHMARK_DATA.map((row) => (
              <tr key={row.model} className={`transition-colors ${row.isBaseline ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{row.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Company Logo */}
                    <div className={`w-8 h-8 rounded border flex items-center justify-center p-1.5 ${
                      row.isBaseline ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-900'
                    }`}>
                      {COMPANY_LOGOS[row.company]}
                    </div>
                    <div>
                      <div className={`font-medium ${row.isBaseline ? 'text-gray-600' : 'text-gray-900'}`}>{row.model}</div>
                      <div className="text-xs text-gray-500">
                        {row.model === 'Human Baseline' ? 'UC Berkeley Engineering Student' : row.company}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 w-full">
                    <span className="font-mono font-medium text-gray-700 w-12 text-right">{row.pass1.toFixed(1)}</span>
                    {/* Visual Progress Bar */}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${
                            row.pass1 > 80 ? 'bg-emerald-500' : 
                            row.pass1 > 50 ? 'bg-blue-500' : 
                            row.pass1 > 20 ? 'bg-amber-500' : 'bg-red-500'
                         }`}
                         style={{ width: `${row.pass1}%` }}
                       />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center">
        Last updated: January 2025 • 50 problems (25 3D, 25 2D)
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span className="font-medium">Note:</span> Using probability-normalized scoring, state-of-the-art AI models score just above the 5% random guessing baseline, while humans achieve 80%.
      </div>
    </section>
  );
}
