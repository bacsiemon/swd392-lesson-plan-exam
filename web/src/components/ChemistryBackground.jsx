import React from 'react';
import './ChemistryBackground.css';

const ChemistryBackground = () => {
  return (
    <div className="chemistry-background">
      {/* Floating molecules */}
      <div className="molecule molecule-1">
        <div className="atom atom-1"></div>
        <div className="bond bond-1"></div>
        <div className="atom atom-2"></div>
        <div className="bond bond-2"></div>
        <div className="atom atom-3"></div>
      </div>
      
      <div className="molecule molecule-2">
        <div className="atom atom-1"></div>
        <div className="bond bond-1"></div>
        <div className="atom atom-2"></div>
      </div>
      
      <div className="molecule molecule-3">
        <div className="atom atom-1"></div>
        <div className="bond bond-1"></div>
        <div className="atom atom-2"></div>
        <div className="bond bond-2"></div>
        <div className="atom atom-3"></div>
        <div className="bond bond-3"></div>
        <div className="atom atom-4"></div>
      </div>
      
      <div className="molecule molecule-4">
        <div className="atom atom-1"></div>
        <div className="bond bond-1"></div>
        <div className="atom atom-2"></div>
      </div>
      
      <div className="molecule molecule-5">
        <div className="atom atom-1"></div>
        <div className="bond bond-1"></div>
        <div className="atom atom-2"></div>
        <div className="bond bond-2"></div>
        <div className="atom atom-3"></div>
      </div>
      
      {/* Floating particles */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
      <div className="particle particle-6"></div>
      <div className="particle particle-7"></div>
      <div className="particle particle-8"></div>
      
      {/* Chemical symbols floating */}
      <div className="symbol symbol-1">H₂O</div>
      <div className="symbol symbol-2">CO₂</div>
      <div className="symbol symbol-3">O₂</div>
      <div className="symbol symbol-4">H₂</div>
      <div className="symbol symbol-5">CH₄</div>
      <div className="symbol symbol-6">NH₃</div>
      
      {/* Gradient overlay */}
      <div className="gradient-overlay"></div>
    </div>
  );
};

export default ChemistryBackground;
