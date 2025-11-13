import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectModal = ({ project, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sauvegarder la position actuelle du scroll
      const scrollY = window.scrollY;

      // Empêcher le scroll de l'arrière-plan
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Compenser la barre de scroll

      // Stocker la position dans un attribut data
      document.body.setAttribute('data-scroll-position', scrollY.toString());
    } else {
      // Restaurer le scroll de l'arrière-plan
      const scrollY = document.body.getAttribute('data-scroll-position');

      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('data-scroll-position');

      // Restaurer la position du scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('data-scroll-position');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  // Autoplay du carrousel
  useEffect(() => {
    if (!isOpen || !project.images || project.images.length <= 1 || isCarouselPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }, 4000); // Change d'image toutes les 4 secondes

    return () => clearInterval(interval);
  }, [isOpen, project, isCarouselPaused]);

  if (!project || !isOpen) return null;

  const nextImage = () => {
    if (project.images) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? project.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop avec flou */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              overflowY: 'auto'
            }}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `linear-gradient(145deg, rgba(30, 30, 30, 0.98), rgba(15, 15, 15, 0.98))`,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                maxWidth: '1200px',
                width: '90%',
                maxHeight: '90vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 40px 120px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)'
              }}
            >
              {/* Bouton de fermeture */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  color: '#fff',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>

              {/* Contenu scrollable */}
              <div
                onWheel={(e) => e.stopPropagation()}
                style={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  height: '100%',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* Caroussel d'images */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                  style={{
                    width: '100%',
                    height: '400px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                  }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={currentImageIndex}
                        src={project.images ? project.images[currentImageIndex] : project.image}
                        alt={`${project.title} - Image ${currentImageIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    </AnimatePresence>

                    {/* Boutons de navigation */}
                    {project.images && project.images.length > 1 && (
                      <>
                        <motion.button
                          onClick={prevImage}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.1, x: -5 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '1.5rem',
                            transform: 'translateY(-50%)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </motion.button>
                        <motion.button
                          onClick={nextImage}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.1, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '1.5rem',
                            transform: 'translateY(-50%)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </motion.button>

                        {/* Indicateurs */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          style={{
                            position: 'absolute',
                            bottom: '1.5rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '0.5rem',
                            zIndex: 10,
                            background: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(10px)',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                          {project.images.map((_, index) => (
                            <motion.div
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                width: index === currentImageIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: index === currentImageIndex ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            />
                          ))}
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Informations */}
                <div style={{
                  padding: '3rem',
                  background: 'transparent'
                }}>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 3rem)',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      color: '#fff',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {project.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{
                      fontSize: '1.5rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: '0 0 3rem 0',
                      fontWeight: '300'
                    }}
                  >
                    {project.subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      margin: '2.5rem 0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.8rem',
                      fontWeight: '500',
                      margin: '0 0 1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      letterSpacing: '-0.01em'
                    }}>
                      <span style={{
                        display: 'block',
                        width: '4px',
                        height: '24px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3))',
                        borderRadius: '2px'
                      }}></span>
                      Description
                    </h3>
                    <p style={{
                      fontSize: '1.2rem',
                      lineHeight: '1.8',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: 0,
                      fontWeight: '300'
                    }}>
                      {project.description || 'Un projet innovant qui repousse les limites du développement moderne.'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{
                      margin: '2.5rem 0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.8rem',
                      fontWeight: '500',
                      margin: '0 0 1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      letterSpacing: '-0.01em'
                    }}>
                      <span style={{
                        display: 'block',
                        width: '4px',
                        height: '24px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3))',
                        borderRadius: '2px'
                      }}></span>
                      Technologies
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      {(project.technologies || ['React', 'Node.js', 'MongoDB']).map((tech, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '30px',
                            fontSize: '1rem',
                            fontWeight: '400',
                            color: '#fff',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            cursor: 'default'
                          }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                      margin: '2.5rem 0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.8rem',
                      fontWeight: '500',
                      margin: '0 0 1.5rem 0',
                      color: 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      letterSpacing: '-0.01em'
                    }}>
                      <span style={{
                        display: 'block',
                        width: '4px',
                        height: '24px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3))',
                        borderRadius: '2px'
                      }}></span>
                      Fonctionnalités clés
                    </h3>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {(project.features || [
                        'Interface utilisateur intuitive et moderne',
                        'Performance optimisée pour tous les appareils'
                      ]).map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.08 }}
                          whileHover={{ x: 5 }}
                          style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease',
                            fontWeight: '300'
                          }}
                        >
                          <span style={{
                            fontSize: '1.5rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>→</span>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {(project.url || project.demo) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginTop: '3rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      {project.url && (
                        <motion.a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '400',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                          </svg>
                          Voir sur GitHub
                        </motion.a>
                      )}
                      {project.demo && (
                        <motion.a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.9), rgba(59, 130, 246, 0.9))',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                          </svg>
                          Démo en ligne
                        </motion.a>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
