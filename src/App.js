import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import { Camera, AlertCircle, Loader2, Cpu, Globe } from 'lucide-react';

// Services & Context
import { NodeSightProvider, useNodeSight } from './context/NodeSightContext';
import VideoFeed from './components/Camera/VideoFeed';
import Controls from './components/Camera/Controls';
import LiveMetrics from './components/Analysis/LiveMetrics';

const AppContent = () => {
  const videoRef = useRef(null);
  const [localModel, setLocalModel] = useState(null);
  const [piUser, setPiUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { results: clusterResults, status } = useNodeSight();

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Pi Network Auth
        if (window.Pi) {
          const auth = await window.Pi.authenticate(['username'], (p) => console.log(p));
          setPiUser(auth.user.username);
        }

        // 2. Load Local TensorFlow Model for "Edge" pre-processing
        const model = await mobilenet.load({ version: 2, alpha: 1.0 });
        setLocalModel(model);
        
        setIsInitializing(false);
      } catch (err) {
        console.error("Initialization failed", err);
        setIsInitializing(false);
      }
    };
    initApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-cyan-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold tracking-widest uppercase">Initializing NodeSight AI</h2>
        <p className="text-sm opacity-50">Syncing local & cluster neural nets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-cyan-400">
            NODE_SIGHT <span className="text-white opacity-20">// AI_CLUSTER_V2</span>
          </h1>
          {piUser && <p className="text-[10px] text-orange-400 uppercase font-bold">Pioneer: {piUser}</p>}
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Cpu size={14} className="text-purple-400" />
            <span className="text-[10px] font-mono">EDGE: {localModel ? 'READY' : 'LOAD'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Globe size={14} className="text-cyan-400" />
            <span className="text-[10px] font-mono">CLUSTER: {status.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Main Analysis Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Viewport - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
            <VideoFeed videoRef={videoRef} />
          </div>
          <Controls videoRef={videoRef} />
        </div>

        {/* Sidebar - Data & Intelligence */}
        <div className="space-y-6">
          <LiveMetrics />
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">System Telemetry</h3>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Protocol</span>
                <span className="text-white">WSS / SOCKET.IO</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Compression</span>
                <span className="text-white">JPEG / 0.7Q</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Inference</span>
                <span className="text-green-400">HYBRID_MODE</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Root Component wrapped in Provider
export default function App() {
  return (
    <NodeSightProvider>
      <AppContent />
    </NodeSightProvider>
  );
}
