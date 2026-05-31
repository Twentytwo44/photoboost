import { useState, useCallback } from 'react';
import type { Sticker, StickerType } from '../../domain/entities/Sticker';

export function useStickers() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const addSticker = useCallback((content: string, type: StickerType = 'emoji') => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      x: 35 + Math.random() * 20, // center-ish with slight variation
      y: 35 + Math.random() * 20,
      scale: 1.0,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  }, []);

  const selectSticker = useCallback((id: string | null) => {
    setSelectedStickerId(id);
  }, []);

  const updateStickerPosition = useCallback((id: string, x: number, y: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : s))
    );
  }, []);

  const updateStickerTransform = useCallback((id: string, scale: number, rotation: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, scale: Math.max(0.2, Math.min(5, scale)), rotation: rotation % 360 } : s))
    );
  }, []);

  const deleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStickerId((prev) => (prev === id ? null : prev));
  }, []);

  const clearStickers = useCallback(() => {
    setStickers([]);
    setSelectedStickerId(null);
  }, []);

  return {
    stickers,
    selectedStickerId,
    addSticker,
    selectSticker,
    updateStickerPosition,
    updateStickerTransform,
    deleteSticker,
    clearStickers,
  };
}
