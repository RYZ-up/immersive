import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import StarBorder from './StarBorder';
import './ProjectGrid.css';

const ProjectGrid = ({ projects, onProjectClick }) => {
  const videoRefs = useRef({});

  const handleMouseEnter = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.play();
    }
  };

  const handleMouseLeave = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <>
      <div className="project-grid">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="project-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            onClick={() => onProjectClick(project)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            style={{
              background: project.gradient || 'linear-gradient(145deg, #1a1a1a, #000)',
              borderColor: project.borderColor || '#333'
            }}
            whileHover={{ y: -10, scale: 1.02 }}
          >
            <div className="project-card-image">
              <img src={project.image} alt={project.title} className="project-card-img" />
              <video
                ref={el => videoRefs.current[index] = el}
                className="project-card-video"
                loop
                muted
                playsInline
              >
                <source src="assets/test.mp4" type="video/mp4" />
              </video>
              <div className="project-card-overlay" />
              <div className="project-title-hover">
                {project.title}
              </div>
              <div className="project-year">
                {project.date}
              </div>
            </div>
            <StarBorder
              as={motion.button}
              className="project-details-button-inline"
              color="rgba(255, 255, 255, 0.8)"
              speed="5s"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onProjectClick(project);
              }}
            >
              Détails
            </StarBorder>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default ProjectGrid;
