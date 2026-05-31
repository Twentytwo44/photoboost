import React from 'react';
import { Camera, CameraOff, Video, FlipHorizontal } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isMirrored: boolean;
  countdown: number | null;
  isShutterFlashing: boolean;
  currentShotIndex: number;
  totalCuts: number;
  isCapturing: boolean;
  showGrid: boolean;
  onStart: () => void;
  onStop: () => void;
  onStartSession: () => void;
  onToggleMirror: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isActive,
  isMirrored,
  countdown,
  isShutterFlashing,
  currentShotIndex,
  totalCuts,
  isCapturing,
  showGrid,
  onStart,
  onStop,
  onStartSession,
  onToggleMirror,
}) => {
  return (
    <div className="camera-section">
      <div className="camera-wrapper">
        {/* Shutter flash feedback overlay */}
        <div className={`flash-shutter ${isShutterFlashing ? 'flashing' : ''}`} />

        {/* Live Video Feed */}
        <video
          ref={videoRef}
          className={`camera-video ${isMirrored ? 'mirrored' : ''} ${
            isActive ? '' : 'hidden'
          }`}
          muted
          playsInline
        />

        {/* Framing Grid guide overlay (dashed lines) */}
        {isActive && showGrid && (
          <div 
            className="camera-grid-guide" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)', borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)', borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)', borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)', borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div style={{ borderRight: '1px dashed rgba(255, 255, 255, 0.3)' }} />
            <div />
          </div>
        )}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="countdown-overlay">{countdown}</div>
        )}

        {/* Placeholder before camera started */}
        {!isActive && (
          <div className="camera-placeholder">
            <Video size={40} strokeWidth={1} />
            <div className="camera-placeholder-text">
              Camera stream inactive.
              <br />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click enable camera to begin.
              </span>
            </div>
          </div>
        )}

        {/* Capturing overlay (e.g. "Shot 2 of 4") */}
        {isCapturing && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#09090b',
              color: '#ffffff',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              border: '1px solid var(--border-color)',
            }}
          >
            SHOT {currentShotIndex + 1} OF {totalCuts}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isActive ? (
          <button onClick={onStart} className="btn-primary" style={{ flex: 1 }}>
            <Camera size={16} /> Enable Camera
          </button>
        ) : (
          <>
            <button
              onClick={onStartSession}
              className="btn-primary"
              disabled={isCapturing}
              style={{ flex: 1 }}
            >
              {isCapturing ? 'CAPTURING...' : 'START SHOOTING'}
            </button>
            
            <button
              onClick={onToggleMirror}
              className={`btn-icon ${isMirrored ? 'active' : ''}`}
              disabled={isCapturing}
              title="Mirror Flip"
            >
              <FlipHorizontal size={16} />
            </button>

            <button
              onClick={onStop}
              className="btn-secondary"
              disabled={isCapturing}
              style={{ padding: '10px 12px' }}
              title="Turn Off Camera"
            >
              <CameraOff size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
