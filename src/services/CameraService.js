/**
 * CameraService
 * Manages hardware access and frame extraction.
 */
class CameraService {
  constructor() {
    this.stream = null;
  }

  async start(videoElement, constraints = { video: { facingMode: 'environment' } }) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoElement) {
        videoElement.srcObject = this.stream;
      }
      return this.stream;
    } catch (err) {
      console.error("🎥 Camera Access Denied:", err);
      throw err;
    }
  }

  /**
   * Captures the current video frame as a Blob or DataURL
   */
  captureFrame(videoElement) {
    if (!videoElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default new CameraService();
