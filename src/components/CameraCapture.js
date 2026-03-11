import React, { useRef } from "react";

export default function CameraCapture({ onCapture }) {
  const inputRef = useRef(null);

  const handleCapture = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result);
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} style={{display:"none"}}/>
      <button onClick={() => inputRef.current.click()}>Capture Image</button>
    </div>
  );
    }
