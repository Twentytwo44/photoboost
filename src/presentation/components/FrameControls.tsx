import React from 'react';
import type { FrameConfig, LayoutType } from '../../domain/entities/FrameConfig';
import { Sliders, Calendar, Layers, Type, Palette, Grid, Volume2, VolumeX } from 'lucide-react';

interface FrameControlsProps {
  frameConfig: FrameConfig;
  setFrameConfig: React.Dispatch<React.SetStateAction<FrameConfig>>;
  timerSeconds: number;
  setTimerSeconds: (s: number) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  isCapturing: boolean;
  cameraError: string | null;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const FRAME_COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#111111' },
  { name: 'Cream', value: '#efeae4' },
  { name: 'Sage', value: '#a9b2a1' },
  { name: 'Lavender', value: '#d2cbe0' },
  { name: 'Navy', value: '#1d2e44' },
];

const TEXT_COLOR_PRESETS = [
  { name: 'Dark', value: '#1a1a1a' },
  { name: 'White', value: '#ffffff' },
  { name: 'Sage', value: '#505d47' },
  { name: 'Gold', value: '#c5a880' },
];

export const FrameControls: React.FC<FrameControlsProps> = ({
  frameConfig,
  setFrameConfig,
  timerSeconds,
  setTimerSeconds,
  activeFilter,
  setActiveFilter,
  isCapturing,
  cameraError,
  showGrid,
  setShowGrid,
  soundEnabled,
  setSoundEnabled,
}) => {
  const updateConfig = (key: keyof FrameConfig, value: any) => {
    setFrameConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="config-section glass-panel">
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} /> Strip Customizer
        </h2>
      </div>

      {cameraError && (
        <div style={{
          padding: '8px 10px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '0.75rem',
          lineHeight: '1.3',
        }}>
          {cameraError}
        </div>
      )}

      {/* 1. Layout Selection */}
      <div className="control-group">
        <div className="panel-title">
          <Layers size={12} /> Layout Format
        </div>
        <div className="control-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {(['1-cut', '2-cut', '4-cut', '2x2', '6-cut'] as LayoutType[]).map((layoutOpt) => (
            <button
              key={layoutOpt}
              onClick={() => updateConfig('layout', layoutOpt)}
              className={`selector-btn ${frameConfig.layout === layoutOpt ? 'active' : ''}`}
              disabled={isCapturing}
              style={{ fontSize: '0.7rem', padding: '6px 2px' }}
            >
              {layoutOpt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Capture Speed / Timer */}
      <div className="control-group">
        <div className="panel-title">
          <Calendar size={12} /> Countdown
        </div>
        <div className="control-grid">
          {[3, 5].map((secs) => (
            <button
              key={secs}
              onClick={() => setTimerSeconds(secs)}
              className={`selector-btn ${timerSeconds === secs ? 'active' : ''}`}
              disabled={isCapturing}
              style={{ gridColumn: 'span 2', padding: '6px' }}
            >
              {secs} Seconds
            </button>
          ))}
        </div>
      </div>

      {/* 3. Image Filters */}
      <div className="control-group">
        <div className="panel-title">
          <Palette size={12} /> Filters
        </div>
        <div className="control-grid fifths">
          {['Original', 'Mono', 'Sepia', 'Vivid', 'Vintage'].map((filt) => (
            <button
              key={filt}
              onClick={() => setActiveFilter(filt)}
              className={`selector-btn ${activeFilter.toLowerCase() === filt.toLowerCase() ? 'active' : ''}`}
              disabled={isCapturing}
              style={{ padding: '6px 2px', fontSize: '0.7rem' }}
            >
              {filt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Combined Color Customizer: Frame & Text (Side-by-side Columns) */}
      <div className="control-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div className="panel-title">
            <Palette size={12} /> Frame Color
          </div>
          <div className="color-presets">
            {FRAME_COLOR_PRESETS.map((col) => (
              <div
                key={col.value}
                className={`color-dot ${frameConfig.bgColor.toLowerCase() === col.value ? 'active' : ''}`}
                style={{ backgroundColor: col.value, width: '18px', height: '18px' }}
                onClick={() => updateConfig('bgColor', col.value)}
              />
            ))}
            <div className="color-picker-wrapper" style={{ width: '18px', height: '18px' }}>
              <input
                type="color"
                className="color-picker-input"
                value={frameConfig.bgColor}
                onChange={(e) => updateConfig('bgColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="panel-title">
            <Type size={12} /> Text Color
          </div>
          <div className="color-presets">
            {TEXT_COLOR_PRESETS.map((col) => (
              <div
                key={col.value}
                className={`color-dot ${frameConfig.textColor.toLowerCase() === col.value ? 'active' : ''}`}
                style={{ backgroundColor: col.value, width: '18px', height: '18px', border: '1px solid rgba(0,0,0,0.06)' }}
                onClick={() => updateConfig('textColor', col.value)}
              />
            ))}
            <div className="color-picker-wrapper" style={{ width: '18px', height: '18px' }}>
              <input
                type="color"
                className="color-picker-input"
                value={frameConfig.textColor}
                onChange={(e) => updateConfig('textColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Custom Bottom Caption & Fonts */}
      <div className="control-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div className="panel-title">
          <Type size={12} /> Frame Caption
        </div>
        <input
          type="text"
          maxLength={24}
          className="text-input-field"
          placeholder="E.g. MEMORIES"
          value={frameConfig.text}
          onChange={(e) => updateConfig('text', e.target.value)}
          disabled={isCapturing}
          style={{ padding: '6px 8px', fontSize: '0.75rem', marginBottom: '8px' }}
        />
        
        <div className="font-presets">
          {[
            { id: 'serif', name: 'Serif', class: 'font-serif-option' },
            { id: 'sans-serif', name: 'Sans', class: 'font-sans-option' },
            { id: 'monospace', name: 'Mono', class: 'font-mono-option' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => updateConfig('fontFamily', f.id)}
              className={`font-btn ${f.class} ${frameConfig.fontFamily === f.id ? 'active' : ''}`}
              disabled={isCapturing}
              style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* 6. App Settings: Grid guides & Shutter feedback */}
      <div className="control-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div className="panel-title">
          <Sliders size={12} /> App Settings
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`font-btn ${showGrid ? 'active' : ''}`}
            style={{ flex: 1, padding: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            disabled={isCapturing}
          >
            <Grid size={12} /> Grid Guides
          </button>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`font-btn ${soundEnabled ? 'active' : ''}`}
            style={{ flex: 1, padding: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            disabled={isCapturing}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />} Shutter Sound
          </button>
        </div>
      </div>
    </div>
  );
};
