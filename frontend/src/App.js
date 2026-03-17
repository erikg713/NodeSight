import React, { useEffect, useRef, useState } from 'react';
import './styles/main.css';

// NodePulse: Real-time AI Scan Interface for Pi Mainnet
function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("System Offline");
  const [aiResult, setAiResult] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // 1. Initialize WebSocket connection to Python AI Engine
    const socket = new WebSocket('ws://localhost:5050');
    
    socket.onopen = () => setStatus("AI Core Connected");
    socket.onmessage = (event) => {
      const data = JSON.loads(event.data);
      setAiResult(data.analysis);
    };
    
    setWs(socket);
    startCamera();

    return () => socket.close();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("Scanner Active");
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setStatus("Hardware Error");
    }
  };

  // 2. Capture frame and send to AI Engine every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN && videoRef.current) {
        sendFrame();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [ws]);

  const sendFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.5);
    
    ws.send(JSON.stringify({ image: base64Image, source: "nodepulse_ui" }));
  };

  return (
    <div className="dashboard-container">
      <header className="pi-status-bar">
        <div>
          <h2 style={{ color: 'var(--pi-gold)' }}>NODESIGHT v1.0</h2>
          <span style={{ fontSize: '0.8rem' }}>NET: PI_MAINNET | {status}</span>
        </div>
        <button className="btn-mainnet">PAY WITH PI</button>
      </header>

      <main className="camera-viewport">
        <div className="scan-line"></div>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      </main>

      <section className="analysis-log">
        <p>[LOG]: Initializing Sentenial-X Neural Pipeline...</p>
        <p>[SYS]: Target detected: {aiResult?.detection || "Scanning..."}</p>
        <p>[SYS]: Threat Level: {aiResult?.threat_level || "Calculating"}</p>
        {aiResult && <p style={{ color: 'white' }}>{JSON.stringify(aiResult)}</p>}
      </section>
    </div>
  );
}

export default App;
