import React from 'react';

const PathTracingRenderer = ({ data }) => {
  return (
    <div className="relative w-full h-full bg-white overflow-hidden select-none font-sans">
      <svg width="100%" height="100%" viewBox="0 0 600 600" className="absolute inset-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 L2,5 Z" fill="#374151" />
          </marker>
        </defs>
        
        {/* Render Edges */}
        {data.edges.map((edge, idx) => (
          <g key={`edge-${idx}`}>
             <path
                d={edge.d}
                fill="none"
                stroke="#374151" // Uniform Color
                strokeWidth={2} // Slightly thinner for cleaner look
                markerEnd="url(#arrowhead)"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
          </g>
        ))}

        {/* Render Nodes */}
        {data.nodes.map((node) => (
          <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
            <circle r="14" fill="white" stroke="#374151" strokeWidth="2" />
            <text 
              dy="4" 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="600" 
              fill="#1f2937"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default PathTracingRenderer;

