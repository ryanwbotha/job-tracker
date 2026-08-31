import React, { useState, useEffect } from 'react';
import './CavemanLoader.css';

const CavemanLoader = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="caveman-loader-container">
      <div className="caveman-image-container">
        <img 
          src="https://community.aseprite.org/uploads/default/original/2X/b/bc534feb5c327deed623c550de55e26ea15ce428.gif" 
          alt="Ug walking" 
          style={{ imageRendering: 'pixelated', width: '96px', height: '96px' }} 
        />
      </div>
      <p className="caveman-text">
        Ug is fetching data from the cave<span className="caveman-dots">{dots}</span>
      </p>
    </div>
  );
};

export default CavemanLoader;
