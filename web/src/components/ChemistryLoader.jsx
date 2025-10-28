import React from 'react';
import '../styles/ChemistryLoader.css';

const ChemistryLoader = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClass = `chemistry-loader-${size}`;
  
  return (
    <div className={`chemistry-loader ${sizeClass}`}>
      <div className="chemistry-loader-content">
        {/* Simple Molecule */}
        <div className="simple-molecule">
          <div className="molecule-center">
            <div className="center-atom"></div>
            <div className="orbit orbit-1">
              <div className="orbit-electron"></div>
            </div>
            <div className="orbit orbit-2">
              <div className="orbit-electron"></div>
            </div>
          </div>
          <div className="outer-atom atom-top"></div>
          <div className="outer-atom atom-right"></div>
          <div className="outer-atom atom-bottom"></div>
          <div className="outer-atom atom-left"></div>
        </div>
        
        {text && (
          <div className="loader-text">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChemistryLoader;
