import React from 'react';
import { categoryColors } from '../constants/elementsBasicData';

const ElementCard = ({ element, onClick }) => {
  const bgColor = categoryColors[element.category] || '#E0E0E0';
  
  return (
    <div
      onClick={() => onClick(element)}
      className="element-card"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
        border: '3px solid #2c3e50',
        borderRadius: '10px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        height: '90px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = '#3498db';
        e.currentTarget.style.zIndex = '10';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        e.currentTarget.style.borderColor = '#2c3e50';
        e.currentTarget.style.zIndex = '1';
      }}
    >
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 'bold', 
        color: '#2c3e50',
        textShadow: '0 1px 2px rgba(255,255,255,0.8)'
      }}>
        {element.atomicNumber}
      </div>
      <div style={{ 
        fontSize: '26px', 
        fontWeight: 'bold', 
        color: '#000',
        textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
        letterSpacing: '1px'
      }}>
        {element.symbol}
      </div>
      <div style={{ 
        fontSize: '10px', 
        color: '#2c3e50', 
        fontWeight: '600',
        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        lineHeight: '1.2'
      }}>
        {element.name}
      </div>
    </div>
  );
};

export default ElementCard;
