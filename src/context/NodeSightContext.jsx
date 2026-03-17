import React, { createContext, useContext, useState, useCallback } from 'react';
import { NodeSightWS, CameraService } from '../services';

const NodeSightContext = createContext();

export const NodeSightProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | connecting | streaming | error

  const startAnalysis = useCallback(async (videoRef) => {
    try {
      setStatus('connecting');
      setIsActive(true);

      // Initialize Socket
      NodeSightWS.connect({
        onPartial: (objs) => setResults(objs),
        onStatusChange: (s) => setStatus(s === 'connected' ? 'streaming' : s),
        onError: (err) => setStatus('error')
      });

      // Start Hardware
      await CameraService.start(videoRef.current);
    } catch (err) {
      setStatus('error');
      setIsActive(false);
    }
  }, []);

  const stopAnalysis = useCallback(() => {
    CameraService.stop();
    NodeSightWS.disconnect();
    setIsActive(false);
    setResults([]);
    setStatus('idle');
  }, []);

  return (
    <NodeSightContext.Provider value={{ 
      isActive, status, results, startAnalysis, stopAnalysis 
    }}>
      {children}
    </NodeSightContext.Provider>
  );
};

export const useNodeSight = () => useContext(NodeSightContext);
