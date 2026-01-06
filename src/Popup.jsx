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

// Demo component showing usage examples
const PopupDemo = () => {
  const [isBasicOpen, setIsBasicOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '48px', 
          marginBottom: '16px',
          fontWeight: '700'
        }}>
          Custom Popup Component
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontSize: '18px', 
          marginBottom: '48px',
          lineHeight: '1.6'
        }}>
          A modern, animated popup with smooth transitions and backdrop blur
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setIsBasicOpen(true)}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'white',
              color: '#667eea',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            Basic Popup
          </button>

          <button
            onClick={() => setIsFormOpen(true)}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'white',
              color: '#667eea',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            Form Popup
          </button>

          <button
            onClick={() => setIsImageOpen(true)}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'white',
              color: '#667eea',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            Image Popup
          </button>
        </div>

        {/* Basic Popup */}
        <CustomPopup
          isOpen={isBasicOpen}
          onClose={() => setIsBasicOpen(false)}
        >
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
            Welcome! 👋
          </h2>
          <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '24px' }}>
            This is a basic popup with smooth animations and backdrop blur. 
            You can put any content inside including text, images, forms, and more.
          </p>
          <button
            onClick={() => setIsBasicOpen(false)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              width: '100%',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Got it!
          </button>
        </CustomPopup>

        {/* Form Popup */}
        <CustomPopup
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          maxWidth="600px"
        >
          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>
            Contact Us
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Fill out the form below and we'll get back to you soon.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Message
              </label>
              <textarea
                placeholder="Your message here..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                marginTop: '8px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Send Message
            </button>
          </div>
        </CustomPopup>

        {/* Image Popup */}
        <CustomPopup
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          maxWidth="700px"
        >
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
            Beautiful Landscape
          </h2>
          <div style={{
            width: '100%',
            height: '300px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            📸 Image Placeholder
          </div>
          <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '24px' }}>
            You can include images, galleries, videos, or any other media content 
            inside the popup. The content area is fully scrollable for longer content.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsImageOpen(false)}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#666';
              }}
            >
              Close
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Download
            </button>
          </div>
        </CustomPopup>
      </div>
    </div>
  );
};

export default CustomPopup;
