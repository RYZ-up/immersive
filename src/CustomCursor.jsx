import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState('');
  const [isPointer, setIsPointer] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Déterminer l'élément survolé
      const target = e.target;
      const tagName = target.tagName.toLowerCase();
      const isClickable =
        tagName === 'a' ||
        tagName === 'button' ||
        target.onclick !== null ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('nav-button') ||
        target.classList.contains('btn-shiny') ||
        target.classList.contains('dock-item') ||
        target.classList.contains('chroma-card');

      setIsPointer(isClickable);

      // Obtenir le texte ou type d'élément
      if (isClickable) {
        const closestButton = target.closest('button');
        const closestLink = target.closest('a');
        const closestCard = target.closest('.chroma-card');
        const closestDockItem = target.closest('.dock-item');

        if (closestButton) {
          setHoveredElement(closestButton.textContent?.trim() || 'Bouton');
        } else if (closestLink) {
          setHoveredElement('Lien');
        } else if (closestCard) {
          setHoveredElement('Projet');
        } else if (closestDockItem) {
          const label = closestDockItem.querySelector('.dock-label');
          setHoveredElement(label?.textContent || 'Menu');
        } else {
          setHoveredElement('Cliquer');
        }
      } else if (tagName === 'input' || tagName === 'textarea') {
        setHoveredElement('Écrire');
      } else if (tagName === 'img') {
        setHoveredElement('Image');
      } else if (tagName === 'video') {
        setHoveredElement('Vidéo');
      } else {
        setHoveredElement('');
      }
    };

    const handleMouseLeave = () => {
      cursorX.set(-100);
      cursorY.set(-100);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Traînée blanche */}
      <motion.div
        className="cursor-trail"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
      />

      {/* Card d'info */}
      <motion.div
        className={`cursor-info-card ${!hoveredElement ? 'hidden' : ''}`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: hoveredElement ? 1 : 0,
          scale: hoveredElement ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        {hoveredElement}
      </motion.div>
    </>
  );
};

export default CustomCursor;
