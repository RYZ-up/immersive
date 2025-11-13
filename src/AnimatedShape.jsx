import React from 'react';
import './AnimatedShape.css';

const AnimatedShape = () => {
  return (
    <div className="animated-shape-container">
      <div className="shape-wrapper">
        {/* Forme principale */}
        <div className="shape-main">
          <div className="shape-ring ring-1"></div>
          <div className="shape-ring ring-2"></div>
          <div className="shape-ring ring-3"></div>
          <div className="shape-core"></div>
        </div>

        {/* Particules orbitales */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="orbital-particle"
            style={{
              '--angle': `${(i * 360) / 12}deg`,
              '--delay': `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      <div className="shape-overlay-text">
        <p>Design interactif</p>
      </div>
    </div>
  );
};

export default AnimatedShape;
