import type { IWebcamService } from '../domain/interfaces/IWebcamService';

export class WebcamServiceImpl implements IWebcamService {
  async startStream(videoElement: HTMLVideoElement): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user', // prefer front camera
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.setAttribute('playsinline', 'true');
    await videoElement.play();
    return stream;
  }

  stopStream(stream: MediaStream | null): void {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  captureFrame(
    videoElement: HTMLVideoElement,
    filter: string,
    mirror: boolean
  ): string {
    const canvas = document.createElement('canvas');
    
    // Use actual video dimensions
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context for frame capture.');
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filter dynamically in 2D context
    switch (filter.toLowerCase()) {
      case 'grayscale':
      case 'mono':
      case 'b&w':
        ctx.filter = 'grayscale(100%) contrast(110%)';
        break;
      case 'sepia':
        ctx.filter = 'sepia(80%) brightness(95%) contrast(90%)';
        break;
      case 'vivid':
        ctx.filter = 'saturate(170%) contrast(115%) brightness(102%)';
        break;
      case 'vintage':
        ctx.filter = 'sepia(25%) saturate(110%) contrast(90%) brightness(105%) hue-rotate(-5deg)';
        break;
      default:
        ctx.filter = 'none';
        break;
    }

    // Apply mirror reflection
    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Draw the current video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Reset filter
    ctx.filter = 'none';

    return canvas.toDataURL('image/jpeg', 0.95);
  }
}
