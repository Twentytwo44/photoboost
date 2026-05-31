export interface IWebcamService {
  startStream(videoElement: HTMLVideoElement): Promise<MediaStream>;
  stopStream(stream: MediaStream | null): void;
  captureFrame(
    videoElement: HTMLVideoElement,
    filter: string,
    mirror: boolean
  ): string; // returns data URL
}
