import React, { useRef, useEffect } from 'react';
import { CameraService, ImageCompressor, NodeSightWS } from '../../services';

const VideoFeed = ({ active }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (active) {
      startPipeline();
    } else {
      CameraService.stop();
      NodeSightWS.disconnect();
    }
  }, [active]);

  const startPipeline = async () => {
    // 1. Start the hardware
    await CameraService.start(videoRef.current);

    // 2. Connect to AI Cluster
    NodeSightWS.connect({
      onPartial: (objects) => drawBoundingBoxes(objects),
      onComplete: (results) => console.log("Final Audit:", results)
    });

    // 3. Analysis Loop (Every 500ms for balance)
    const interval = setInterval(async () => {
      if (!active) return clearInterval(interval);
      
      const frame = CameraService.captureFrame(videoRef.current);
      const compressed = await ImageCompressor.compress(frame, { maxWidth: 640 });
      NodeSightWS.analyze(compressed);
    }, 500);
  };

  const drawBoundingBoxes = (objects) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.font = '16px Monospace';

    objects.forEach(obj => {
      // Scale coordinates from AI resolution to screen resolution
      const [x, y, w, h] = obj.bbox; 
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`${obj.label} (${Math.round(obj.conf * 100)}%)`, x, y - 5);
    });
  };

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-auto grayscale-[0.3]"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default VideoFeed;
