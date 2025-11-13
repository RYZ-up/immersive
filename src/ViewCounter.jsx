import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ViewCounter.css';

const ViewCounter = () => {
  const [views, setViews] = useState(0);
  const [displayViews, setDisplayViews] = useState(0);

  useEffect(() => {
    // Récupérer le nombre de vues depuis localStorage
    const storedViews = localStorage.getItem('siteViews');
    const currentViews = storedViews ? parseInt(storedViews, 10) : 0;
    const newViews = currentViews + 1;

    // Sauvegarder le nouveau nombre de vues
    localStorage.setItem('siteViews', newViews.toString());
    setViews(newViews);

    // Animation du compteur
    let start = 0;
    const duration = 2000; // 2 secondes
    const increment = newViews / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= newViews) {
        setDisplayViews(newViews);
        clearInterval(counter);
      } else {
        setDisplayViews(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, []);

  return (
    <motion.div
      className="view-counter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="counter-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <div className="counter-content">
        <span className="counter-label">Vues totales</span>
        <motion.span
          className="counter-number"
          key={displayViews}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {displayViews.toLocaleString('fr-FR')}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default ViewCounter;
