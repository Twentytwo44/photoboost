import React, { useState } from 'react';
import type { Photo } from '../../domain/entities/Photo';
import type { FrameConfig } from '../../domain/entities/FrameConfig';
import type { Sticker } from '../../domain/entities/Sticker';
import { StickerWorkspace } from './StickerWorkspace';
import { GenerateGifUseCase } from '../../domain/usecases/GenerateGifUseCase';
import { ShareStripUseCase } from '../../domain/usecases/ShareStripUseCase';
import { GifServiceImpl } from '../../data/GifServiceImpl';
import { StorageServiceImpl } from '../../data/StorageServiceImpl';
import QRCode from 'qrcode';
import { Download, Film, Share2, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';

interface ExportModalProps {
  photos: Photo[];
  frameConfig: FrameConfig;
  activeFilter: string;
  stickers: Sticker[];
  selectedStickerId: string | null;
  onAddSticker: (content: string) => void;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickerPosition: (id: string, x: number, y: number) => void;
  onUpdateStickerTransform: (id: string, scale: number, rotation: number) => void;
  onDeleteSticker: (id: string) => void;
  onClose: () => void;
}

const STICKER_LIST = [
  '❤️', '💖', '⭐', '🌟', '✨', '⚡', '🌸', '🍀', '🎈', '🎉',
  '🎀', '👑', '🕶️', '🐱', '🐻', '🧸', '🍕', '🍦', '🌈', '☀️',
  '🌙', '🎨', '📷', '🔥', '💎', '🥳', '👻', '👽', '🐾', '💌'
];

const gifService = new GifServiceImpl();
const storageService = new StorageServiceImpl();
const generateGifUseCase = new GenerateGifUseCase(gifService);
const shareStripUseCase = new ShareStripUseCase(storageService);

export const ExportModal: React.FC<ExportModalProps> = ({
  photos,
  frameConfig,
  activeFilter,
  stickers,
  selectedStickerId,
  onAddSticker,
  onSelectSticker,
  onUpdateStickerPosition,
  onUpdateStickerTransform,
  onDeleteSticker,
  onClose,
}) => {
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // High-Resolution Composite Canvas Drawer
  const drawHighResCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      try {
        const layout = frameConfig.layout;
        const workspaceElement = document.querySelector('.sticker-workspace-container');
        const workspaceWidth = workspaceElement ? workspaceElement.clientWidth : 250;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');

        // Layout Dimensions Definition (High Resolution)
        const layoutCols = (layout === '6-cut' || layout === '2x2') ? 2 : 1;
        const layoutRows = 
          layout === '1-cut' ? 1 :
          layout === '2-cut' ? 2 :
          layout === '2x2' ? 2 :
          layout === '4-cut' ? 4 : 3;
        const photoAspectRatio = layout === '1-cut' ? 1.0 : 4 / 3;

        let canvasWidth = (layout === '6-cut' || layout === '2x2') ? 1400 : 1200;
        let padding = 50;
        let gap = 30;
        let bottomPadding = 160;

        const slotWidth = (canvasWidth - 2 * padding - (layoutCols - 1) * gap) / layoutCols;
        const slotHeight = slotWidth / photoAspectRatio;
        
        let canvasHeight = 2 * padding + layoutRows * slotHeight + (layoutRows - 1) * gap + bottomPadding;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 1. Draw Background Frame Paper
        if (frameConfig.pattern === 'polkadot') {
          const dotColor = frameConfig.dotColor || '#a1a1aa';
          
          const patternCanvas = document.createElement('canvas');
          patternCanvas.width = 60;
          patternCanvas.height = 60;
          const pctx = patternCanvas.getContext('2d');
          if (pctx) {
            pctx.fillStyle = frameConfig.bgColor;
            pctx.fillRect(0, 0, 60, 60);
            
            pctx.fillStyle = dotColor;
            pctx.beginPath();
            pctx.arc(30, 30, 4, 0, 2 * Math.PI);
            pctx.arc(0, 0, 4, 0, 2 * Math.PI);
            pctx.arc(60, 0, 4, 0, 2 * Math.PI);
            pctx.arc(0, 60, 4, 0, 2 * Math.PI);
            pctx.arc(60, 60, 4, 0, 2 * Math.PI);
            pctx.fill();
            
            const pattern = ctx.createPattern(patternCanvas, 'repeat');
            if (pattern) {
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            } else {
              ctx.fillStyle = frameConfig.bgColor;
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
          } else {
            ctx.fillStyle = frameConfig.bgColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
        } else {
          ctx.fillStyle = frameConfig.bgColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // 2. Draw Captured Photos into slots
        const totalCuts =
          layout === '1-cut' ? 1 :
          layout === '2-cut' ? 2 :
          layout === '2x2' ? 4 :
          layout === '4-cut' ? 4 : 6;

        const drawPromises = Array.from({ length: totalCuts }).map((_, i) => {
          return new Promise<void>((imgResolve) => {
            const photo = photos[i];
            if (!photo) {
              imgResolve(); // Empty placeholder
              return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const col = i % layoutCols;
              const row = Math.floor(i / layoutCols);
              const x = padding + col * (slotWidth + gap);
              const y = padding + row * (slotHeight + gap);

              // Draw image clipped inside slot
              ctx.save();
              ctx.beginPath();
              ctx.rect(x, y, slotWidth, slotHeight);
              ctx.clip();
              
              // Draw image (already filter-baked)
              ctx.drawImage(img, x, y, slotWidth, slotHeight);
              ctx.restore();
              imgResolve();
            };
            img.onerror = () => {
              imgResolve(); // resolve anyway
            };
            img.src = photo.dataUrl;
          });
        });

        Promise.all(drawPromises).then(() => {
          // 3. Draw Bottom Frame Text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = frameConfig.textColor;

          let fontSize = 90;
          let fontName = 'var(--font-sans)';
          if (frameConfig.fontFamily === 'serif') {
            fontName = "'Playfair Display', serif";
            fontSize = 110;
          } else if (frameConfig.fontFamily === 'monospace') {
            fontName = "'Montserrat', sans-serif";
            fontSize = 75;
          }

          ctx.font = `600 ${fontSize}px ${fontName}`;
          ctx.fillText(
            frameConfig.text.toUpperCase() || 'MEMORIES',
            canvasWidth / 2,
            canvasHeight - bottomPadding / 2
          );

          // 4. Draw Stickers
          stickers.forEach((st) => {
            const stickerX = (st.x / 100) * canvasWidth;
            const stickerY = (st.y / 100) * canvasHeight;
            
            // Proportional scaling factor from workspace element to physical canvas width
            const scaleFactor = st.scale * (canvasWidth / workspaceWidth);

            ctx.save();
            ctx.translate(stickerX, stickerY);
            ctx.rotate((st.rotation * Math.PI) / 180);
            
            // Draw Emoji Stickers
            const stickerFontSize = Math.floor(32 * scaleFactor);
            ctx.font = `${stickerFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(st.content, 0, 0);
            ctx.restore();
          });

          resolve(canvas);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleDownloadPNG = async () => {
    setErrorMsg(null);
    try {
      const canvas = await drawHighResCanvas();
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to render photo strip image.');
    }
  };

  const handleDownloadGIF = async () => {
    setErrorMsg(null);
    setIsGeneratingGif(true);
    try {
      const imageUrls = photos.map((p) => p.dataUrl);
      const gifDataUrl = await generateGifUseCase.execute(imageUrls, 800);
      
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.gif`;
      link.href = gifDataUrl;
      link.click();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate animated GIF.');
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleGetQRCode = async () => {
    if (shareUrl && qrCodeUrl) return; // Already uploaded
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const canvas = await drawHighResCanvas();
      const base64Image = canvas.toDataURL('image/png');
      
      // Upload to tmpfiles.org
      const publicUrl = await shareStripUseCase.execute(base64Image);
      setShareUrl(publicUrl);

      // Generate local QR Code image
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload photo strip.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Left Side: Photo Strip & Stickers Workspace */}
        <div className="modal-left">
          <StickerWorkspace
            photos={photos}
            frameConfig={frameConfig}
            activeFilter={activeFilter}
            stickers={stickers}
            selectedStickerId={selectedStickerId}
            onSelectSticker={onSelectSticker}
            onUpdateStickerPosition={onUpdateStickerPosition}
            onUpdateStickerTransform={onUpdateStickerTransform}
            onDeleteSticker={onDeleteSticker}
          />
        </div>

        {/* Right Side: Stickers Picker & Share/Export Actions */}
        <div className="modal-right">
          <div>
            <div className="modal-header">
              <h3 className="modal-title">Decorate & Share</h3>
              <p className="modal-subtitle">
                Add stickers onto your strip, then export
              </p>
            </div>

            {errorMsg && (
              <div style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '16px',
                border: '1px solid rgba(239, 68, 68, 0.15)'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Sticker Selection */}
            <div className="control-group">
              <div className="panel-title">Add Stickers</div>
              <div className="sticker-picker">
                {STICKER_LIST.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => onAddSticker(sticker)}
                    className="sticker-option"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                * Select placed sticker to drag, resize, rotate, or delete.
              </span>
            </div>

            {/* Export options */}
            <div className="control-group">
              <div className="panel-title">Downloads</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={handleDownloadPNG} className="btn-secondary">
                  <Download size={16} /> Photo Strip
                </button>
                <button
                  onClick={handleDownloadGIF}
                  className="btn-secondary"
                  disabled={isGeneratingGif}
                >
                  {isGeneratingGif ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <Film size={16} />
                  )}
                  GIF Loop
                </button>
              </div>
            </div>

            {/* Cloud Sharing (QR Code) */}
            <div className="control-group">
              <div className="panel-title">Cloud Sharing</div>
              <div className="action-box">
                {!shareUrl && !isUploading && (
                  <button
                    onClick={handleGetQRCode}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Share2 size={16} /> Generate Share Link & QR Code
                  </button>
                )}

                {isUploading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 0' }}>
                    <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s infinite linear' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Uploading composite file to cloud...
                    </span>
                  </div>
                )}

                {shareUrl && qrCodeUrl && (
                  <div className="share-section">
                    <img
                      src={qrCodeUrl}
                      alt="QR Link Code"
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div className="share-info">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Scan on Mobile Phone
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                        Scan this QR Code to download directly to your mobile photos. Link expires in 24 hours.
                      </span>
                      
                      <div className="share-url-container">
                        <input
                          type="text"
                          readOnly
                          className="share-url-input"
                          value={shareUrl}
                        />
                        <button
                          onClick={handleCopyLink}
                          className="btn-icon"
                          style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                          title="Copy Link"
                        >
                          {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bottom-actions">
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              disabled={isGeneratingGif || isUploading}
            >
              <ArrowLeft size={16} /> Retake / Back
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
