import React from "react";

export default function FinalResults({ result }) {
  if (!result) return null;
  return (
    <div className="final-results">
      <h3>Final Analysis</h3>
      {result.objects.map((obj,idx)=>(
        <div key={idx}><strong>{obj.label}</strong> - {(obj.confidence*100).toFixed(1)}%</div>
      ))}
    </div>
  );
}
