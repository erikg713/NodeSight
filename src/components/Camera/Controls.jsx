import React from 'react';
import { useNodeSight } from '../../context/NodeSightContext';

const Controls = ({ videoRef }) => {
  const { isActive, status, startAnalysis, stopAnalysis } = useNodeSight();

  return (
    <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
      {!isActive ? (
        <button 
          onClick={() => startAnalysis(videoRef)}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all"
        >
          INITIALIZE SIGHT
        </button>
      ) : (
        <button 
          onClick={stopAnalysis}
          className="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-all"
        >
          TERMINATE STREAM
        </button>
      )}

      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${status === 'streaming' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-xs uppercase tracking-widest opacity-70">{status}</span>
      </div>
    </div>
  );
};

export default Controls;
