import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Heart, Coffee, ShieldCheck } from 'lucide-react';

interface DonateModalProps {
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ onClose }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate a clean mock donation QR code pointing to Buy Me a Coffee or developer page
    QRCode.toDataURL('https://www.buymeacoffee.com/creator', {
      width: 200,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('Failed to generate donation QR code:', err));
  }, []);

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '520px', 
          gridTemplateColumns: '1fr', 
          padding: '30px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="btn-icon" 
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px',
            border: 'none',
            background: 'none'
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Heart size={28} style={{ color: '#ef4444', marginBottom: '10px' }} />
          <h3 className="modal-title" style={{ fontSize: '1.4rem' }}>Support the Creator</h3>
          <p className="modal-subtitle">
            Keep PHOTOBOOST server-free and ad-free
          </p>
        </div>

        {/* Body Text */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' }}>
          PHOTOBOOST is a client-side photobooth designed to be clean, private, and free of advertising. 
          If you enjoy creating memories here, please consider supporting the project to help pay for temporary cloud storage hosting and domain maintenance.
        </div>

        {/* Donation options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {/* QR Scan Method (Mock PromptPay/Ko-Fi QR) */}
          {qrUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <img 
                src={qrUrl} 
                alt="Donation QR Code" 
                style={{ 
                  width: '160px', 
                  height: '160px', 
                  border: '1px solid var(--border-color)',
                  padding: '4px'
                }} 
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Scan to Support / PromptPay
              </span>
            </div>
          ) : (
            <div style={{ width: '160px', height: '160px', background: 'var(--bg-tertiary)' }} />
          )}

          {/* Direct Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="https://www.buymeacoffee.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary" 
              style={{ textDecoration: 'none', display: 'flex', width: '100%', gap: '8px' }}
            >
              <Coffee size={16} /> Buy Me a Coffee
            </a>
          </div>
        </div>

        {/* Privacy Note */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.75rem'
        }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span>Donations are optional and secured via standard channels.</span>
        </div>
      </div>
    </div>
  );
};
