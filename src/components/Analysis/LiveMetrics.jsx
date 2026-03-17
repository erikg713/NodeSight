import React, { useState, useEffect } from 'react';
import { NodeSightWS } from '../../services';

const LiveMetrics = () => {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    // We hook into the existing singleton connection
    NodeSightWS.onPartial = (objs) => setDetections(objs);
  }, []);

  return (
    <div className="p-4 bg-slate-900 text-cyan-400 font-mono text-sm rounded-lg border border-cyan-900/50">
      <h3 className="mb-2 text-xs uppercase opacity-50">Live Intelligence Stream</h3>
      <ul>
        {detections.length > 0 ? (
          detections.map((d, i) => (
            <li key={i} className="flex justify-between border-b border-white/5 py-1">
              <span>{d.label}</span>
              <span className="text-white">{(d.conf * 100).toFixed(1)}%</span>
            </li>
          ))
        ) : (
          <li className="animate-pulse">Scanning environment...</li>
        )}
      </ul>
    </div>
  );
};
