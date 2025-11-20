import React, { useState } from 'react';
import BenchmarkLeaderboard from './components/BenchmarkLeaderboard';
import PracticeGame from './components/PracticeGame';
import { Box, Info, X } from 'lucide-react';

function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white relative">
      
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-8 relative">
             <button 
               onClick={() => setShowAbout(false)}
               className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
             >
               <X size={24} />
             </button>
             
             <div className="mb-6">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                   <Box size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">About SpatialBench</h3>
             </div>
             
             <div className="space-y-4 text-gray-600 leading-relaxed">
               <p>
                 <strong>SpatialBench</strong> is designed to evaluate the next generation of multimodal AI models on their ability to reason about space, structure, and pathing.
               </p>
               <p>
                 Just as humans use visual tracing and mental rotation for complex tasks like <strong>circuit analysis</strong>, <strong>CAD engineering</strong>, and <strong>molecular biology</strong>, future AI systems must possess these intrinsic capabilities to fully automate physical world reasoning.
               </p>
               <p>
                 We test models not just on what they know, but on how well they can "see" and manipulate abstract concepts in 2D and 3D space.
               </p>
             </div>

             <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
               <button 
                 onClick={() => setShowAbout(false)}
                 className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-colors"
               >
                 Close
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="bg-black text-white p-1 rounded">
              <Box size={18} strokeWidth={3} />
            </div>
            <span>SpatialBench</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-black transition-colors">Leaderboard</button>
            <button onClick={() => document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black transition-colors">Practice</button>
            <button onClick={() => setShowAbout(true)} className="hover:text-black transition-colors">About</button>
            <a href="/spatialbench/spatialbench.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Proof of Completeness</a>
            <a href="https://github.com/spicylemonade/spatialbench" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 transition-colors">GitHub</a>
          </div>
        </div>
      </nav>

      <main className="flex flex-col gap-12">
        
        {/* Hero / Benchmark Section */}
        <div className="pt-12 pb-6 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
          <div className="max-w-6xl mx-auto">
             <BenchmarkLeaderboard />
          </div>
        </div>

        {/* Practice Section */}
        <div className="max-w-6xl mx-auto w-full pb-24" id="practice">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Human vs Model</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Test your own spatial reasoning capabilities against the same tasks used to evaluate state-of-the-art multimodal models.
            </p>
          </div>
          
          <PracticeGame />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <div className="mb-6">
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4 justify-center">
              <Box size={16} /> SpatialBench
            </div>
            <p className="mb-4">Open source benchmarks for multimodal AI reasoning.</p>
          </div>
          <div>
            <a href="https://twitter.com/spicey_lemonade" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black hover:underline transition-colors">
              Twitter / X: @spicey_lemonade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
