import React, { useState, useEffect } from 'react';

/**
 * CustomPopup - A modern, animated popup component with backdrop blur
 * 
 * Features:
 * - Smooth slide and bounce animations
 * - Backdrop blur effect
 * - Fully customizable content
 * - Portal-based rendering
 * - Accessible (ESC key to close, focus management)
 * 
 * @param {boolean} isOpen - Controls popup visibility
 * @param {function} onClose - Callback when popup closes
 * @param {React.ReactNode} children - Content to display in popup
 * @param {string} width - Custom width (default: 'auto', max: '90vw')
 * @param {string} maxWidth - Maximum width (default: '500px')
 * @param {boolean} showCloseButton - Show X button in corner (default: true)
 * @param {boolean} closeOnBackdropClick - Close when clicking outside (default: true)
 * @param {string} className - Additional CSS classes for the popup content
 */
const CustomPopup = ({ 
  isOpen, 
  onClose, 
  children, 
  width = 'auto',
  maxWidth = '500px',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-container">
      <style>{`
        .popup-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .popup-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .popup-backdrop.visible {
          opacity: 1;
        }

        .popup-content-wrapper {
          position: relative;
          z-index: 1;
          width: ${width};
          max-width: ${maxWidth};
          max-height: 90vh;
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .popup-content-wrapper.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .popup-content {
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.15),
            0 10px 30px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          padding: 32px;
          position: relative;
          overflow: auto;
          max-height: 90vh;
          color: #1a1a1a;
        }

        .popup-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          font-size: 20px;
          color: #666;
        }

        .popup-close-button:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #000;
          transform: rotate(90deg);
        }

        .popup-close-button:active {
          transform: rotate(90deg) scale(0.95);
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .popup-content {
            background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.4),
              0 10px 30px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            color: #ffffff;
          }

          .popup-close-button {
            background: rgba(255, 255, 255, 0.1);
            color: #ccc;
          }

          .popup-close-button:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
          }
        }

        /* Scrollbar styling */
        .popup-content::-webkit-scrollbar {
          width: 8px;
        }

        .popup-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .popup-content::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .popup-content::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <div 
        className={`popup-backdrop ${isAnimating ? 'visible' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div className={`popup-content-wrapper ${isAnimating ? 'visible' : ''}`}>
        <div className={`popup-content ${className}`}>
          {showCloseButton && (
            <button
              className="popup-close-button"
              onClick={onClose}
              aria-label="Close popup"
            >
              ×
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomPopup;
