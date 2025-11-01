import React from 'react';
import '../styles/ChemistryPageLoader.css';

const ChemistryPageLoader = () => {
  return (
    <div className="chemistry-loader-overlay">
      <div className="chemistry-loader-container">
        {/* Main Molecule Animation */}
        <div className="molecule-structure">
          {/* Central atom */}
          <div className="atom central-atom">
            <div className="atom-core"></div>
            <div className="electron-orbit orbit-1">
              <div className="electron"></div>
            </div>
            <div className="electron-orbit orbit-2">
              <div className="electron"></div>
            </div>
            <div className="electron-orbit orbit-3">
              <div className="electron"></div>
            </div>
          </div>
          
          {/* Surrounding atoms */}
          <div className="atom surrounding-atom atom-1">
            <div className="atom-core small"></div>
          </div>
          <div className="atom surrounding-atom atom-2">
            <div className="atom-core small"></div>
          </div>
          <div className="atom surrounding-atom atom-3">
            <div className="atom-core small"></div>
          </div>
          <div className="atom surrounding-atom atom-4">
            <div className="atom-core small"></div>
          </div>
          
          {/* Bonds */}
          <div className="bond bond-1"></div>
          <div className="bond bond-2"></div>
          <div className="bond bond-3"></div>
          <div className="bond bond-4"></div>
        </div>

        {/* Test Tubes Animation */}
        <div className="test-tubes">
          <div className="test-tube tube-1">
            <div className="tube-glass"></div>
            <div className="tube-liquid liquid-1"></div>
            <div className="bubbles">
              <span className="bubble"></span>
              <span className="bubble"></span>
              <span className="bubble"></span>
            </div>
          </div>
          <div className="test-tube tube-2">
            <div className="tube-glass"></div>
            <div className="tube-liquid liquid-2"></div>
            <div className="bubbles">
              <span className="bubble"></span>
              <span className="bubble"></span>
            </div>
          </div>
          <div className="test-tube tube-3">
            <div className="tube-glass"></div>
            <div className="tube-liquid liquid-3"></div>
            <div className="bubbles">
              <span className="bubble"></span>
              <span className="bubble"></span>
              <span className="bubble"></span>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="loading-text">
          <span className="loading-dot">Đ</span>
          <span className="loading-dot">a</span>
          <span className="loading-dot">n</span>
          <span className="loading-dot">g</span>
          <span className="loading-dot"> </span>
          <span className="loading-dot">t</span>
          <span className="loading-dot">ả</span>
          <span className="loading-dot">i</span>
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
        </div>

        {/* Chemical Formula Animation */}
        <div className="chemical-formulas">
          <span className="formula formula-1">H₂O</span>
          <span className="formula formula-2">CO₂</span>
          <span className="formula formula-3">NaCl</span>
          <span className="formula formula-4">H₂SO₄</span>
        </div>
      </div>
    </div>
  );
};

export default ChemistryPageLoader;
