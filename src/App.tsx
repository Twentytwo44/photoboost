import React, { useState, useEffect } from 'react';
import { CameraView } from './presentation/components/CameraView';
import { PhotoStripPreview } from './presentation/components/PhotoStripPreview';
import { FrameControls } from './presentation/components/FrameControls';
import { ExportModal } from './presentation/components/ExportModal';
import { DonateModal } from './presentation/components/DonateModal';

import { useWebcam } from './presentation/hooks/useWebcam';
import { usePhotobooth } from './presentation/hooks/usePhotobooth';
import { useStickers } from './presentation/hooks/useStickers';
import { DEFAULT_FRAME_CONFIG } from './domain/entities/FrameConfig';
import type { FrameConfig } from './domain/entities/FrameConfig';

import './presentation/styles/theme.css';
import { Camera } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

export const App: React.FC = () => {
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(DEFAULT_FRAME_CONFIG);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState<number>(3);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synthesis of shutter click sound using Web Audio API (no assets required)
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (err) {
      console.error('Audio synthesizer error:', err);
    }
  };

  // Custom presentation hooks
  const {
    videoRef,
    isActive: isCameraActive,
    error: cameraError,
    activeFilter,
    isMirrored,
    setActiveFilter,
    setIsMirrored,
    startCamera,
    stopCamera,
    capture,
  } = useWebcam();

  const {
    photos,
    isCapturing,
    countdown,
    currentShotIndex,
    isShutterFlashing,
    startCaptureSession,
    resetSession,
  } = usePhotobooth();

  const {
    stickers,
    selectedStickerId,
    addSticker,
    selectSticker,
    updateStickerPosition,
    updateStickerTransform,
    deleteSticker,
    clearStickers,
  } = useStickers();

  const getTotalCuts = (layout: typeof frameConfig.layout): number => {
    switch (layout) {
      case '1-cut': return 1;
      case '2-cut': return 2;
      case '2x2': return 4;
      case '4-cut': return 4;
      case '6-cut': return 6;
      default: return 4;
    }
  };

  // Watch for session capture completion to trigger the decoration/export modal
  useEffect(() => {
    const totalCuts = getTotalCuts(frameConfig.layout);
    if (photos.length === totalCuts && !isCapturing && photos.length > 0) {
      setIsModalOpen(true);
    }
  }, [photos, isCapturing, frameConfig.layout]);

  const handleStartSession = () => {
    const cutsCount = getTotalCuts(frameConfig.layout);
    // Clear stickers and trigger the capture callback
    clearStickers();
    startCaptureSession(timerSeconds, cutsCount, () => {
      if (soundEnabled) {
        playShutterSound();
      }
      return capture();
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetSession();
    clearStickers();
  };

  // Autoplay camera on mount for premium experience
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="app-container">
      {/* 1. Elegant Minimal Header */}
      <header className="app-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="logo">
            <Camera size={20} style={{ color: 'var(--text-primary)' }} />
            PHOTOBOOST
          </h1>
          <span className="logo-sub">Studio Photobooth Camera</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Header Link to Support */}
          <button 
            onClick={() => setIsDonateOpen(true)} 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Support Creator
          </button>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isCameraActive ? '#10b981' : '#ef4444',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              {isCameraActive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. SEO Introduction Block */}
      <section className="seo-intro-section">
        <h2 className="seo-title-tag">
          Online Sticker Photobooth Camera
        </h2>
        <p className="seo-paragraph-tag">
          Create, customize, and capture vintage-style photo strips directly in your browser. 
          Select classic layouts like 4-Cut strips or 6-Cut grids, apply retro black-and-white filters, 
          add custom caption text, overlay emojis, and generate shareable download links with QR codes instantly.
        </p>
      </section>

      {/* 3. Main Dashboard Layout */}
      <main className="app-main">
        {/* Column 1: Live Stream */}
        <section className="camera-column">
          <CameraView
            videoRef={videoRef}
            isActive={isCameraActive}
            isMirrored={isMirrored}
            countdown={countdown}
            isShutterFlashing={isShutterFlashing}
            currentShotIndex={currentShotIndex}
            totalCuts={getTotalCuts(frameConfig.layout)}
            isCapturing={isCapturing}
            showGrid={showGrid}
            onStart={startCamera}
            onStop={stopCamera}
            onStartSession={handleStartSession}
            onToggleMirror={() => setIsMirrored(!isMirrored)}
          />
        </section>

        {/* Column 2: Customization Settings */}
        <section className="controls-column">
          <FrameControls
            frameConfig={frameConfig}
            setFrameConfig={setFrameConfig}
            timerSeconds={timerSeconds}
            setTimerSeconds={setTimerSeconds}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isCapturing={isCapturing}
            cameraError={cameraError}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        </section>

        {/* Column 3: Photo Strip Preview */}
        <section className="preview-column">
          <div className="panel-title" style={{ paddingLeft: '8px' }}>
            Live Photo Strip
          </div>
          <PhotoStripPreview
            photos={photos}
            frameConfig={frameConfig}
            activeFilter={activeFilter}
            isCapturing={isCapturing}
            currentShotIndex={currentShotIndex}
          />
        </section>
      </main>

      {/* 4. SEO-Friendly Minimal Footer */}
      <footer className="app-footer">
        <div>
          <strong>PHOTOBOOST Studio</strong> &copy; {new Date().getFullYear()} — Client-side Photobooth Camera. All rights reserved.
        </div>
        <div className="footer-links">
          <span>4-Cut Film Strip</span>
          <span>6-Cut Grid Collage</span>
          <span>Vintage Camera Filters</span>
          <span>QR Code Image Share</span>
        </div>
      </footer>

      {/* 3. Post-capture Decoration & Export Overlay Modal */}
      {isModalOpen && (
        <ExportModal
          photos={photos}
          frameConfig={frameConfig}
          activeFilter={activeFilter}
          stickers={stickers}
          selectedStickerId={selectedStickerId}
          onAddSticker={addSticker}
          onSelectSticker={selectSticker}
          onUpdateStickerPosition={updateStickerPosition}
          onUpdateStickerTransform={updateStickerTransform}
          onDeleteSticker={deleteSticker}
          onClose={handleCloseModal}
        />
      )}

      {/* 4. Donation Modal */}
      {isDonateOpen && (
        <DonateModal onClose={() => setIsDonateOpen(false)} />
      )}
      <SpeedInsights />
      <Analytics />
    </div>
  );
};

export default App;
