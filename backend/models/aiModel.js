// Placeholder AI inference logic
module.exports = {
  streamInference: async (imageBuffer) => {
    // Simulate streaming partial detections
    return [
      [{ label: "Tree", confidence: 0.65 }],
      [{ label: "Tree", confidence: 0.75 }, { label: "Bird", confidence: 0.40 }]
    ];
  },
  finalInference: async (imageBuffer) => {
    // Simulate final result
    return {
      objects: [
        { label: "Tree", confidence: 0.90 },
        { label: "Bird", confidence: 0.65 }
      ]
    };
  }
};
