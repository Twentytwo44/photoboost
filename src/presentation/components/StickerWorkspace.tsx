import React, { useRef, useEffect } from 'react';
import type { Photo } from '../../domain/entities/Photo';
import type { FrameConfig } from '../../domain/entities/FrameConfig';
import type { Sticker } from '../../domain/entities/Sticker';
import { X, RotateCw } from 'lucide-react';

interface StickerWorkspaceProps {
  photos: Photo[];
  frameConfig: FrameConfig;
  activeFilter: string;
  stickers: Sticker[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickerPosition: (id: string, x: number, y: number) => void;
  onUpdateStickerTransform: (id: string, scale: number, rotation: number) => void;
  onDeleteSticker: (id: string) => void;
}

export const StickerWorkspace: React.FC<StickerWorkspaceProps> = ({
  photos,
  frameConfig,
  activeFilter,
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateStickerPosition,
  onUpdateStickerTransform,
  onDeleteSticker,
}) => {
  const { bgColor, textColor, text, fontFamily, layout } = frameConfig;
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const totalSlots =
    layout === '1-cut' ? 1 :
    layout === '2-cut' ? 2 :
    layout === '2x2' ? 4 :
    layout === '4-cut' ? 4 : 6;

  // Filter application helper
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
        return 'sepia(25%) saturate(110%) contrast(90%) brightness(105%)';
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

  // Drag and drop interaction handlers
  const handleStickerDragStart = (e: React.MouseEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectSticker(sticker.id);

    const workspace = workspaceRef.current;
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPctX = sticker.x;
    const initialPctY = sticker.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert pixel deltas to percentages relative to container dimensions
      const deltaPctX = (deltaX / rect.width) * 100;
      const deltaPctY = (deltaY / rect.height) * 100;

      onUpdateStickerPosition(sticker.id, initialPctX + deltaPctX, initialPctY + deltaPctY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch device support for dragging
  const handleStickerTouchStart = (e: React.TouchEvent, sticker: Sticker) => {
    e.stopPropagation();
    onSelectSticker(sticker.id);

    const workspace = workspaceRef.current;
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const initialPctX = sticker.x;
    const initialPctY = sticker.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const currentTouch = moveEvent.touches[0];
      const deltaX = currentTouch.clientX - startX;
      const deltaY = currentTouch.clientY - startY;

      const deltaPctX = (deltaX / rect.width) * 100;
      const deltaPctY = (deltaY / rect.height) * 100;

      onUpdateStickerPosition(sticker.id, initialPctX + deltaPctX, initialPctY + deltaPctY);
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Scaling and Rotation using single coordinate delta angle calculations
  const handleTransformStart = (e: React.MouseEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();

    const workspace = workspaceRef.current;
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    // Approximate pixel center of sticker
    const stickerPixelX = rect.left + (sticker.x / 100) * rect.width;
    const stickerPixelY = rect.top + (sticker.y / 100) * rect.height;

    const startX = e.clientX;
    const startY = e.clientY;

    const dxStart = startX - stickerPixelX;
    const dyStart = startY - stickerPixelY;
    
    // Initial angle and distance from center
    const startAngle = Math.atan2(dyStart, dxStart);
    const startDist = Math.sqrt(dxStart * dxStart + dyStart * dyStart);
    const initialScale = sticker.scale;
    const initialRotation = sticker.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dxCurrent = moveEvent.clientX - stickerPixelX;
      const dyCurrent = moveEvent.clientY - stickerPixelY;

      const currentAngle = Math.atan2(dyCurrent, dxCurrent);
      const currentDist = Math.sqrt(dxCurrent * dxCurrent + dyCurrent * dyCurrent);

      // Compute transform outputs
      const angleDiff = currentAngle - startAngle;
      const scaleMultiplier = currentDist / startDist;

      const newRotation = initialRotation + (angleDiff * 180) / Math.PI;
      const newScale = initialScale * scaleMultiplier;

      onUpdateStickerTransform(sticker.id, newScale, newRotation);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Click outside to deselect
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(e.target as Node)
      ) {
        onSelectSticker(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onSelectSticker]);

  return (
    <div
      ref={workspaceRef}
      className={`sticker-workspace-container photo-strip layout-${layout}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        cursor: 'default',
      }}
    >
      {/* Photo Slots */}
      {Array.from({ length: totalSlots }).map((_, i) => {
        const photo = photos[i];
        return (
          <div key={`workspace-slot-${i}`} className={`photo-slot ${layout === '1-cut' ? 'square' : ''}`}>
            {photo ? (
              <img
                src={photo.dataUrl}
                alt={`Grid cell ${i + 1}`}
                style={{ filter: getFilterStyle() }}
                draggable="false"
              />
            ) : (
              <div className="photo-slot-placeholder">Slot {i + 1}</div>
            )}
          </div>
        );
      })}

      {/* Frame Bottom Title */}
      <div
        className="photo-strip-text"
        style={{
          fontFamily: getFontFamilyStyle(),
          color: textColor,
        }}
      >
        {text || 'MEMORIES'}
      </div>

      {/* Absolute Placed Stickers */}
      {stickers.map((st) => {
        const isSelected = selectedStickerId === st.id;
        return (
          <div
            key={st.id}
            className={`placed-sticker ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
              zIndex: isSelected ? 30 : 20,
            }}
            onMouseDown={(e) => handleStickerDragStart(e, st)}
            onTouchStart={(e) => handleStickerTouchStart(e, st)}
          >
            <span className="sticker-content">{st.content}</span>
            {isSelected && (
              <>
                {/* Delete handle */}
                <div
                  className="sticker-handle-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSticker(st.id);
                  }}
                  title="Remove sticker"
                >
                  <X size={10} strokeWidth={3} />
                </div>
                {/* Scale/Rotate handle */}
                <div
                  className="sticker-handle-rotate"
                  onMouseDown={(e) => handleTransformStart(e, st)}
                  title="Rotate / Resize"
                >
                  <RotateCw size={10} strokeWidth={3} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
