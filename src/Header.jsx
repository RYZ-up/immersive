import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarBorder from './StarBorder';
import './Header.css';

const ShinyText = ({ text, speed = 5 }) => {
  return (
    <span
      className="shiny-text-header"
      style={{
        display: 'inline-block',
        background: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        animation: `shineHeader ${speed}s linear infinite`,
      }}
    >
      {text}
    </span>
  );
};

const Header = ({ isVisible = true, language = 'fr', onLanguageToggle }) => {
  const handleLanguageToggle = () => {
    if (onLanguageToggle) {
      onLanguageToggle();
    }
  };

  const currentLanguage = language === 'fr' ? 'FR' : 'EN';

  return (
    <>
      {/* Logo et nom en haut à gauche */}
      <motion.div
        className="header-corner header-left"
        initial={{ x: -50, opacity: 0 }}
        animate={{
          x: isVisible ? 0 : -50,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 15,
          delay: isVisible ? 0.4 : 0
        }}
      >
        <div className="logo-container">
          <div className="name-container">
            <motion.h1
              className="header-name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
            <ShinyText text="Rayane Y." speed={4} />
            </motion.h1>
          </div>
        </div>
      </motion.div>

      {/* Bouton de langue en haut à droite */}
      <motion.div
        className="header-corner header-right"
        initial={{ x: 50, opacity: 0 }}
        animate={{
          x: isVisible ? 0 : 50,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 15,
          delay: isVisible ? 0.5 : 0
        }}
      >
        <StarBorder
          as={motion.button}
          className="language-button"
          color="rgba(255, 255, 255, 0.6)"
          speed="6s"
          onClick={handleLanguageToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="language-text" style={{ marginLeft: '0.5rem' }}>
            <ShinyText text={currentLanguage} speed={5} />
          </span>
        </StarBorder>
      </motion.div>
    </>
  );
};

export default Header;
