import React from 'react';
import { X, Maximize2 } from 'lucide-react';

/**
 * ImagePreview Component
 * Handles the display of the captured or uploaded image with clear 
 * action overlays for the Pioneer user.
 */
const ImagePreview = ({ imageURL, onClear, isAnalyzing }) => {
  if (!imageURL) return null;

  return (
    <div className="preview-container">
      <div className="preview-overlay">
        {!isAnalyzing && (
          <button 
            className="clear-btn" 
            onClick={onClear}
            aria-label="Remove image"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <img 
        src={imageURL} 
        alt="NodeSight Preview" 
        className={`preview-image ${isAnalyzing ? 'analyzing-pulse' : ''}`} 
      />
      
      {isAnalyzing && (
        <div className="analysis-scanner">
          <div className="scanner-line"></div>
        </div>
      )}

      <style jsx>{`
        .preview-container {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .preview-image {
          display: block;
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          transition: opacity 0.3s ease;
        }

        .analyzing-pulse {
          opacity: 0.7;
        }

        .preview-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d63031;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .analysis-scanner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .scanner-line {
          width: 100%;
          height: 2px;
          background: var(--pi-gold, #ffa000);
          box-shadow: 0 0 15px var(--pi-gold, #ffa000);
          position: absolute;
          top: 0;
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ImagePreview;
