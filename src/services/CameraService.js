/**
 * CameraService
 * Interfaces with the browser's MediaDevices API.
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
   * Grabs a frame from the video track without stopping the stream.
   */
  captureFrame(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    return canvas.toDataURL('image/jpeg');
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default new CameraService();
