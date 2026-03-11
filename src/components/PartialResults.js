import React from "react";

export default function PartialResults({ objects }) {
  if (!objects || objects.length === 0) return null;
  return (
    <div className="partial-results">
      <h4>Partial Detection</h4>
      <ul>{objects.map((obj,idx)=><li key={idx}>{obj.label} ({(obj.confidence*100).toFixed(1)}%)</li>)}</ul>
    </div>
  );
}
