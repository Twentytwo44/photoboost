export type StickerType = 'emoji' | 'image';

export interface Sticker {
  id: string;
  content: string; // Emoji character or image URL path
  type: StickerType;
  x: number;       // Percent position X (0 to 100) relative to photo strip container
  y: number;       // Percent position Y (0 to 100) relative to photo strip container
  scale: number;   // Scale factor (default 1)
  rotation: number;// Rotation in degrees (0 to 360)
}
