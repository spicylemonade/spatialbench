import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import * as THREE from 'three'; // Needed for vector math
import ShapeRenderer from './ShapeRenderer';
import PathTracingRenderer from './PathTracingRenderer';
import { generateVoxelStructure, mutateVoxelStructure, generatePathData } from '../utils/spatialLogic';

// Helper to generate a camera angle significantly different from reference
const generateDistinctCameraPosition = () => {
    const ref = new THREE.Vector3(10, 10, 10); // Updated reference to match new default
    let pos = new THREE.Vector3();
    let valid = false;
    let attempts = 0;

    while(!valid && attempts < 100) {
       const radius = 14; // Zoomed in (reduced from 20)
       const theta = Math.random() * Math.PI * 2; 
       const phi = Math.random() * Math.PI;       
       
       pos.setFromSphericalCoords(radius, phi, theta);
       
       // Ensure significant angular difference (> ~45 degrees)
       if (pos.angleTo(ref) > 0.8) {
           valid = true;
       }
       attempts++;
    }
    return [pos.x, pos.y, pos.z];
};

export default function PracticeGame() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState('playing'); 
  const [selectedOption, setSelectedOption] = useState(null); // For 3D
  const [inputValue, setInputValue] = useState(''); // For 2D
  const [feedback, setFeedback] = useState(null);
  
  const [mode, setMode] = useState('3d'); 
  const [levelData, setLevelData] = useState(null);
  const [options, setOptions] = useState([]);

  const generateLevel = () => {
    const nextMode = Math.random() > 0.5 ? '3d' : '2d';
    setMode(nextMode);

    if (nextMode === '3d') {
        // Generate base shape (Correct Answer)
        const shapeA = generateVoxelStructure();
        
        // Generate distractor shapes by mutating the base shape
        // This ensures they are "similar but different"
        const shapeB = mutateVoxelStructure(shapeA, 3);
        const shapeC = mutateVoxelStructure(shapeA, 3);
        const shapeD = mutateVoxelStructure(shapeA, 3);

        // Generate distinct camera angles for all options
        // For the correct option (shapeA), we MUST ensure the angle is different from reference
        // For distractors, random angles are fine, but let's apply the same logic for consistency
        const cameraA = generateDistinctCameraPosition();
        const cameraB = generateDistinctCameraPosition();
        const cameraC = generateDistinctCameraPosition();
        const cameraD = generateDistinctCameraPosition();

        const rawOptions = [
            { id: 'opt1', content: shapeA, correct: true, type: 'voxel', camera: cameraA },
            { id: 'opt2', content: shapeB, correct: false, type: 'voxel', camera: cameraB },
            { id: 'opt3', content: shapeC, correct: false, type: 'voxel', camera: cameraC },
            { id: 'opt4', content: shapeD, correct: false, type: 'voxel', camera: cameraD },
        ];
        
        const shuffled = rawOptions
            .map(v => ({ v, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ v }, idx) => ({ ...v, label: ['A', 'B', 'C', 'D'][idx] }));

        setLevelData(shapeA); 
        setOptions(shuffled);
    } else {
        const pathData = generatePathData(600, 600);
        setLevelData(pathData);
        setOptions([]); // No options for 2D mode
    }

    setGameState('playing');
    setSelectedOption(null);
    setInputValue('');
    setFeedback(null);
  };

  useEffect(() => {
    generateLevel();
  }, []);

  const handleGuess3D = (option) => {
    if (gameState !== 'playing') return;
    setSelectedOption(option.label);
    
    if (option.correct) {
      handleCorrect();
    } else {
      handleIncorrect('Incorrect structure');
    }
  };

  const handleSubmit2D = (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    
    const guess = parseInt(inputValue);
    if (isNaN(guess)) return;

    if (guess === levelData.answerId) {
        handleCorrect();
    } else {
        handleIncorrect(`Wrong destination. It was #${levelData.answerId}`);
    }
  };

  const handleCorrect = () => {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback('Correct');
      setGameState('result');
  };

  const handleIncorrect = (msg) => {
      setStreak(0);
      setFeedback(msg);
      setGameState('result');
  };

  const nextRound = () => {
    setRound(r => r + 1);
    generateLevel();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50/50 rounded-3xl border border-gray-100 my-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Practice Arena
            </h3>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mt-1 flex items-center gap-2">
               {mode === '3d' ? 'Spatial Rotation' : 'Path Integration'}
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               Round {round}
            </p>
          </div>
          
          <div className="flex gap-6 text-sm">
             <div className="text-right">
               <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Score</div>
               <div className="font-mono font-bold text-gray-900">{score}</div>
             </div>
             <div className="text-right">
               <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Streak</div>
               <div className="font-mono font-bold text-gray-900">{streak}</div>
             </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="game-container" 
            data-answer={mode === '3d' ? options.find(o => o.correct)?.label : levelData?.answerId}
            data-mode={mode}
            data-round={round}
      >
          
          {/* --- Puzzle View --- */}
          <div className="lg:col-span-7 flex flex-col">
            
            <div className="mb-4">
                 <span className="bg-white px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                    {mode === '3d' ? 'Identify the rotated match' : 'What # does the arrow coming out of 0 point to?'}
                 </span>
            </div>

            <div className="w-full aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden relative shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              
              {/* 3D RENDERER */}
              {mode === '3d' && levelData && (
                <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-b from-white to-gray-50">
                    <ShapeRenderer 
                      voxels={levelData} 
                      width={400} 
                      height={400} 
                      randomView={false} // Uses default view (12, 9.6, 12)
                    />
                </div>
              )}

              {/* 2D RENDERER */}
              {mode === '2d' && levelData && (
                 <PathTracingRenderer data={levelData} />
              )}
            </div>
          </div>

          {/* --- Input View --- */}
          <div className="lg:col-span-5 flex flex-col justify-center">
             
             {/* 3D OPTIONS */}
             {mode === '3d' && (
                <div className="grid grid-cols-2 gap-3">
                    {options.map((opt) => (
                    <button
                        key={opt.label}
                        onClick={() => handleGuess3D(opt)}
                        disabled={gameState !== 'playing'}
                        className={`
                        group relative rounded-xl border transition-all duration-200 text-left overflow-hidden
                        flex flex-col items-center justify-center p-2 aspect-square
                        ${gameState === 'playing' 
                            ? 'border-gray-200 hover:border-gray-400 hover:shadow-md bg-white' 
                            : ''
                        }
                        ${gameState === 'result' && opt.correct 
                            ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                            : ''
                        }
                        ${gameState === 'result' && !opt.correct && selectedOption === opt.label
                            ? 'border-red-400 bg-red-50' 
                            : ''
                        }
                        ${gameState === 'result' && !opt.correct && selectedOption !== opt.label
                            ? 'border-gray-100 opacity-50 bg-gray-50' 
                            : ''
                        }
                        `}
                    >
                        <div className="pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
                            {/* Use the specific camera position generated for this option */}
                            <ShapeRenderer 
                                voxels={opt.content} 
                                width={140} 
                                height={140} 
                                cameraPosition={opt.camera}
                            />
                        </div>

                        <div className="absolute top-3 left-3">
                        <span className={`
                            w-6 h-6 flex items-center justify-center rounded text-xs font-bold
                            ${gameState === 'playing' ? 'bg-gray-100 text-gray-500' : ''}
                            ${gameState === 'result' && opt.correct ? 'bg-green-200 text-green-700' : ''}
                            ${gameState === 'result' && !opt.correct ? 'bg-gray-100 text-gray-400' : ''}
                        `}>
                            {opt.label}
                        </span>
                        </div>
                        
                        {gameState === 'result' && opt.correct && (
                            <div className="absolute bottom-3 right-3">
                                <CheckCircle className="text-green-600 w-5 h-5" />
                            </div>
                        )}
                        {gameState === 'result' && !opt.correct && selectedOption === opt.label && (
                            <div className="absolute bottom-3 right-3">
                                <XCircle className="text-red-500 w-5 h-5" />
                            </div>
                        )}
                    </button>
                    ))}
                </div>
             )}

             {/* 2D INPUT */}
             {mode === '2d' && (
                 <div className="w-full max-w-xs mx-auto">
                    <form onSubmit={handleSubmit2D} className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <label htmlFor="node-input" className="block text-sm font-medium text-gray-700">
                                Destination Node ID
                            </label>
                            <input 
                                id="node-input"
                                type="number" 
                                autoFocus
                                placeholder="0"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={gameState !== 'playing'}
                                className="w-full px-4 py-3 text-2xl font-mono text-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                            />
                        </div>
                        {gameState === 'playing' && (
                            <button 
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Submit Answer
                            </button>
                        )}
                    </form>

                    {gameState === 'result' && (
                        <div className={`mt-6 p-4 rounded-lg text-center text-sm font-medium border ${feedback === 'Correct' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            {feedback}
                        </div>
                    )}
                 </div>
             )}

             <div className="h-20 mt-6 flex items-center justify-end">
               {gameState === 'result' && (
                  <button 
                    onClick={nextRound}
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg hover:bg-gray-800 hover:translate-y-[-1px] transition-all flex items-center gap-2"
                  >
                    Next Challenge <ArrowRight size={16} />
                  </button>
               )}
             </div>
          </div>
        </div>
    </div>
  );
}
