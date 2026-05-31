import { useState, useCallback, useRef } from 'react';
import type { Photo } from '../../domain/entities/Photo';

export function usePhotobooth() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  
  // Keep values in mutable refs to avoid stale closures in timeouts/intervals
  const photosRef = useRef<Photo[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSession = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPhotos([]);
    photosRef.current = [];
    setIsCapturing(false);
    setCountdown(null);
    setCurrentShotIndex(0);
    setIsShutterFlashing(false);
  }, []);

  const startCaptureSession = useCallback(
    (
      countdownDuration: number,
      totalCuts: number,
      captureCallback: () => string
    ) => {
      resetSession();
      setIsCapturing(true);
      setCurrentShotIndex(0);

      const takeNextShot = (shotIndex: number) => {
        if (shotIndex >= totalCuts) {
          setIsCapturing(false);
          setCountdown(null);
          return;
        }

        setCurrentShotIndex(shotIndex);
        let count = countdownDuration;
        setCountdown(count);

        const tick = () => {
          if (count > 1) {
            count -= 1;
            setCountdown(count);
            timerRef.current = setTimeout(tick, 1000);
          } else {
            // Flash shutter & capture immediately
            setCountdown(null);
            setIsShutterFlashing(true);

            // Give a microsecond delay to render the flash visual in UI before capture
            setTimeout(() => {
              try {
                const dataUrl = captureCallback();
                const newPhoto: Photo = {
                  id: `photo-${Date.now()}-${shotIndex}`,
                  dataUrl,
                  timestamp: Date.now(),
                };
                
                const updatedPhotos = [...photosRef.current, newPhoto];
                photosRef.current = updatedPhotos;
                setPhotos(updatedPhotos);
              } catch (err) {
                console.error('Failed to capture photo frame:', err);
              }

              // Turn off flash and proceed to next photo
              setTimeout(() => {
                setIsShutterFlashing(false);
                // Pause slightly between cuts for a natural feel
                timerRef.current = setTimeout(() => {
                  takeNextShot(shotIndex + 1);
                }, 1000);
              }, 200);
            }, 100);
          }
        };

        timerRef.current = setTimeout(tick, 1000);
      };

      // Start the sequence after a tiny delay
      timerRef.current = setTimeout(() => {
        takeNextShot(0);
      }, 500);
    },
    [resetSession]
  );

  return {
    photos,
    isCapturing,
    countdown,
    currentShotIndex,
    isShutterFlashing,
    startCaptureSession,
    resetSession,
  };
}
