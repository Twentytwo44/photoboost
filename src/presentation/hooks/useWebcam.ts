import { useState, useCallback, useRef } from 'react';
import { WebcamServiceImpl } from '../../data/WebcamServiceImpl';

const webcamService = new WebcamServiceImpl();

export function useWebcam() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('original');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    try {
      // Clean up previous stream if any
      if (stream) {
        webcamService.stopStream(stream);
      }
      const newStream = await webcamService.startStream(videoRef.current);
      setStream(newStream);
    } catch (err: any) {
      console.error('Error starting camera stream:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please grant permission in your browser.'
          : 'Could not access camera. Please check your connection.'
      );
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      webcamService.stopStream(stream);
      setStream(null);
    }
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !stream) {
      throw new Error('Camera is not active or video element is missing.');
    }
    return webcamService.captureFrame(videoRef.current, activeFilter, isMirrored);
  }, [stream, activeFilter, isMirrored]);

  return {
    videoRef,
    stream,
    isActive: !!stream,
    error,
    activeFilter,
    isMirrored,
    setActiveFilter,
    setIsMirrored,
    startCamera,
    stopCamera,
    capture,
  };
}
