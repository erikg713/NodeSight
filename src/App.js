import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import { Camera, Upload, AlertCircle, Loader2 } from 'lucide-react';
import './App.css'; // Assuming basic styling

function App() {
  const [model, setModel] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [results, setResults] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [piUser, setPiUser] = useState(null);
  
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Pi SDK and TensorFlow Model
  useEffect(() => {
    const initializeNodeSight = async () => {
      try {
        // Authenticate with Pi Network
        if (window.Pi) {
          const scopes = ['username'];
          const authResults = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
          setPiUser(authResults.user.username);
        }

        // Load the lightweight MobileNet model
        const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        setModel(loadedModel);
        setIsInitializing(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize NodeSight. Please ensure camera access and Pi Browser environment.");
        setIsInitializing(false);
      }
    };

    initializeNodeSight();
  }, []);

  // Required callback for Pi SDK payments (stubbed for now)
  const onIncompletePaymentFound = (payment) => {
    console.log("Incomplete payment found:", payment);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setResults([]);
      setError(null);
    } else {
      setError("Camera access denied or no image selected.");
    }
  };

  const analyzeImage = async () => {
    if (!model || !imageRef.current) return;
    
    setIsAnalyzing(true);
    try {
      // Run the image through the distributed local node (browser)
      const classifications = await model.classify(imageRef.current);
      setResults(classifications);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze the image. Please try again.");
    }
    setIsAnalyzing(false);
  };

  if (isInitializing) {
    return (
      <div className="flex-center full-height">
        <Loader2 className="spinner" size={48} />
        <h2>Initializing NodeSight AI...</h2>
        <p>Syncing lightweight neural nets...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NodeSight</h1>
        {piUser && <span className="user-badge">Pioneer: {piUser}</span>}
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="image-viewer">
          {imageURL ? (
            <img 
              src={imageURL} 
              alt="Subject to analyze" 
              ref={imageRef} 
              crossOrigin="anonymous" 
            />
          ) : (
            <div className="placeholder">
              <Camera size={64} className="placeholder-icon" />
              <p>Capture an object to begin</p>
            </div>
          )}
        </div>

        <div className="controls">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          
          {!imageURL ? (
             <button 
              className="btn primary"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={20} />
              Scan Object
            </button>
          ) : (
            <div className="action-group">
              <button 
                className="btn secondary"
                onClick={() => fileInputRef.current.click()}
              >
                <Upload size={20} />
                Retake
              </button>
              <button 
                className="btn primary"
                onClick={analyzeImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 className="spinner" size={20} /> : "Run AI Analysis"}
              </button>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="results-container">
            <h3>Analysis Results</h3>
            <ul className="results-list">
              {results.map((result, index) => (
                <li key={index} className="result-item">
                  <span className="class-name">{result.className}</span>
                  <span className="probability">
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
