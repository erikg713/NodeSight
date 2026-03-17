export { default as NodeSightWS } from './NodeSightWS';
export { default as ImageCompressor } from './ImageCompressor';
export { default as CameraService } from './CameraService';
// Example Usage in a React Component
import { CameraService, ImageCompressor, NodeSightWS } from '../services';

const startAnalysis = async (videoRef) => {
  // 1. Setup Connection
  NodeSightWS.connect({
    onPartial: (objs) => console.log("Detected:", objs),
    onComplete: (res) => console.log("Final Report:", res)
  });

  // 2. Start Hardware
  await CameraService.start(videoRef.current);

  // 3. Begin Analysis Loop
  setInterval(async () => {
    const rawFrame = CameraService.captureFrame(videoRef.current);
    const tinyFrame = await ImageCompressor.compress(rawFrame, { maxWidth: 640 });
    
    NodeSightWS.analyze(tinyFrame);
  }, 1000); // Analyze once per second
};
