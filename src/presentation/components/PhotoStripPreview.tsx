import React from 'react';
import type { Photo } from '../../domain/entities/Photo';
import type { FrameConfig } from '../../domain/entities/FrameConfig';
import { Image as ImageIcon } from 'lucide-react';

interface PhotoStripPreviewProps {
  photos: Photo[];
  frameConfig: FrameConfig;
  activeFilter: string;
  isCapturing: boolean;
  currentShotIndex: number;
}

export const PhotoStripPreview: React.FC<PhotoStripPreviewProps> = ({
  photos,
  frameConfig,
  activeFilter,
  isCapturing,
  currentShotIndex,
}) => {
  const { bgColor, textColor, text, fontFamily, layout } = frameConfig;

  // Determine number of slots based on layout
  const totalSlots =
    layout === '1-cut' ? 1 :
    layout === '2-cut' ? 2 :
    layout === '2x2' ? 4 :
    layout === '4-cut' ? 4 : 6;

  // Dynamic filter css styling for the preview images
  const getFilterStyle = () => {
    switch (activeFilter.toLowerCase()) {
      case 'grayscale':
      case 'mono':
      case 'b&w':
        return 'grayscale(100%) contrast(110%)';
      case 'sepia':
        return 'sepia(80%) brightness(95%) contrast(90%)';
      case 'vivid':
        return 'saturate(170%) contrast(115%) brightness(102%)';
      case 'vintage':
        return 'sepia(25%) saturate(110%) contrast(90%) brightness(105%) hue-rotate(-5deg)';
      default:
        return 'none';
    }
  };

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'sans-serif':
        return 'var(--font-sans)';
      case 'serif':
        return 'var(--font-serif)';
      case 'monospace':
        return "'Montserrat', monospace";
      default:
        return 'var(--font-sans)';
    }
  };

  // Render photo slot placeholders
  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      const photo = photos[i];
      const isActiveSlot = isCapturing && currentShotIndex === i;

      slots.push(
        <div
          key={`slot-${i}`}
          className={`photo-slot ${layout === '1-cut' ? 'square' : ''} ${isActiveSlot ? 'shimmer-bg' : ''}`}
          style={{
            border: isActiveSlot ? '2px solid var(--accent-gold)' : 'none',
            boxShadow: isActiveSlot ? '0 0 15px rgba(197, 168, 128, 0.4)' : 'none',
          }}
        >
          {photo ? (
            <img
              src={photo.dataUrl}
              alt={`Captured snapshot ${i + 1}`}
              style={{ filter: getFilterStyle() }}
            />
          ) : (
            <div className="photo-slot-placeholder">
              {isActiveSlot ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'inline-block',
                      animation: 'pulse 1s infinite alternate',
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                    SHOOTING...
                  </span>
                </div>
              ) : (
                <ImageIcon size={20} strokeWidth={1} />
              )}
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="preview-container">
      <div
        className={`photo-strip layout-${layout}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {renderSlots()}
        <div
          className="photo-strip-text"
          style={{
            fontFamily: getFontFamilyStyle(),
            color: textColor,
          }}
        >
          {text || 'MEMORIES'}
        </div>
      </div>
    </div>
  );
};
