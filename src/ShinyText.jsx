import React from 'react';
import { motion } from 'motion/react';
import './ShinyText.css';

const ShinyText = ({ children, className = '', disabled = false, speed = 5, ...props }) => {
  if (disabled) {
    return <span className={className} {...props}>{children}</span>;
  }

  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{
        '--shiny-animation-speed': `${speed}s`,
      }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default ShinyText;
