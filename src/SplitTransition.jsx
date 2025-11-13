import React from 'react';
import { motion } from 'framer-motion';

const SplitTransition = ({ onComplete }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      {/* Partie gauche */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '50%',
          background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        initial={{ x: 0 }}
        animate={{
          x: '-100%'
        }}
        transition={{
          duration: 1.4,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.1
        }}
        onAnimationComplete={onComplete}
      >
        {/* Ligne de séparation lumineuse */}
        <motion.div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.6), transparent)',
            boxShadow: '0 0 30px rgba(255,255,255,0.5)'
          }}
          animate={{
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* Partie droite */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '50%',
          background: 'linear-gradient(270deg, #0a0a0a 0%, #1a1a1a 100%)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        initial={{ x: 0 }}
        animate={{
          x: '100%'
        }}
        transition={{
          duration: 1.4,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.1
        }}
      >
        {/* Ligne de séparation lumineuse */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.6), transparent)',
            boxShadow: '0 0 30px rgba(255,255,255,0.5)'
          }}
          animate={{
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </div>
  );
};

export default SplitTransition;
