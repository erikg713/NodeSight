import React from "react";
import { Layers } from "lucide-react";
import { formatConfidence } from "../utils/helpers";

/**
 * PartialResults Component
 * Displays real-time metadata as the AI processes the image.
 */
export default function PartialResults({ objects }) {
  if (!objects || objects.length === 0) return null;

  return (
    <div className="partial-results">
      <div className="partial-header">
        <Layers size={16} className="header-icon" />
        <h4>Partial Detection</h4>
      </div>
      <ul className="partial-list">
        {objects.map((obj, idx) => (
          <li key={idx} className="partial-item">
            <span className="label">{obj.className || obj.label}</span>
            <span className="confidence">{formatConfidence(obj.probability || obj.confidence)}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .partial-results {
          margin-top: 1rem;
          padding: 12px;
          background: #f0f2f5;
          border-radius: 8px;
          border-left: 4px solid var(--pi-purple, #673ab7);
        }

        .partial-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #555;
        }

        .partial-header h4 {
          margin: 0;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .partial-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .partial-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding: 4px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .partial-item:last-child {
          border-bottom: none;
        }

        .label {
          color: #2d3436;
          font-weight: 500;
        }

        .confidence {
          color: var(--pi-purple);
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
