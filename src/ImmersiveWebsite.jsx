import React, { useEffect, useRef, useState, useMemo, Children, cloneElement } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectGrid from './ProjectGrid';
import ProjectModal from './ProjectModal';
import Header from './Header';
import ContactCard from './ContactCard';
import SplitTransition from './SplitTransition';
import ScrambleText from './ScrambleText';
import RotatingText from './RotatingText';
import Dither from './Dither';
import CountUp from './CountUp';
import Model3DViewer from './Model3DViewer';
import TiltedCard from './TiltedCard';
import { techLogos } from './techLogos';
import FlowingMenu from './FlowingMenu';
import Counter from './Counter';
import PixelCard from './PixelCard';
import SpotlightCard from './SpotlightCard';

gsap.registerPlugin(ScrollTrigger);

// ==================== SHINY TEXT COMPONENT ====================
const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};

// ==================== SCROLL TO TOP BUTTON ====================
const ScrollToTopButton = ({ show }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ==================== DOCK COMPONENTS ====================
function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child => cloneElement(child, { isHovered }))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="dock-outer">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ==================== SCROLL REVEAL COMPONENT ====================
const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.3,
  baseRotation = 1,
  blurStrength = 2,
  containerClassName = '',
  textClassName = '',
  as = 'h2'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      {
        ease: 'none',
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom',
          end: 'bottom top+=30%',
          scrub: true,
          toggleActions: 'play reverse play reverse'
        }
      }
    );

    const wordElements = el.querySelectorAll('.word');

    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: 'opacity' },
      {
        ease: 'none',
        opacity: 1,
        stagger: 0.02,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom-=5%',
          end: 'center center',
          scrub: 0.5,
          toggleActions: 'play reverse play reverse'
        }
      }
    );

    if (enableBlur) {
      gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: 'none',
          filter: 'blur(0px)',
          stagger: 0.02,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=5%',
            end: 'center center',
            scrub: 0.5,
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, blurStrength]);

  const Component = as;

  return (
    <Component ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <span className={`scroll-reveal-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
};

// ==================== ANIMATED SECTION ====================
const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 60
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  }, [delay]);

  return <div ref={ref}>{children}</div>;
};

// ==================== MAIN APP ====================
export default function ImmersiveWebsite() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [currentSection, setCurrentSection] = useState('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsScrolledPastHero(scrollPos > window.innerHeight * 0.3);
      setShowScrollTop(scrollPos > window.innerHeight * 1.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';

    let isScrolling = false;
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;

    const smoothScroll = () => {
      if (Math.abs(targetScroll - currentScroll) > 0.5) {
        const diff = targetScroll - currentScroll;
        const easing = diff * 0.08; // Ralentissement avec accélération exponentielle
        currentScroll += easing;
        window.scrollTo(0, currentScroll);
        requestAnimationFrame(smoothScroll);
      } else {
        isScrolling = false;
        currentScroll = targetScroll;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      targetScroll += e.deltaY * 0.5; // Ralentir le scroll
      targetScroll = Math.max(0, Math.min(targetScroll, document.documentElement.scrollHeight - window.innerHeight));

      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScroll);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Scroll roulette effect - Optimisé
  useEffect(() => {
    const sections = document.querySelectorAll('.content-section');

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        {
          opacity: 0.8,
          scale: 0.98
        },
        {
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom-=100px',
            end: 'top center',
            scrub: 0.5,
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          // Lancer la transition immédiatement après le chargement
          setShowTransition(true);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    // Petit délai pour s'assurer que l'état est mis à jour
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Utiliser un scroll plus robuste
        const yOffset = -100; // Offset pour le header fixe
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        console.warn(`Element with id "${sectionId}" not found`);
      }
    }, 100);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const translations = {
    fr: {
      hero: {
        title: ['Solutions', 'Créations', 'Visions', 'Performances'],
        subtitle:  ' ',
        explore: 'Explorer'
      },
      nav: {
        home: 'Accueil',
        projects: 'Projets',
        about: 'À propos',
        skills: 'Compétences'
      },
      projects: {
        title: 'Mes Projets',
        description: 'Découvrez mes réalisations et projets qui allient créativité, technique et innovation pour créer des expériences digitales uniques et mémorables.'
      },
      about: {
        title: 'À Propos',
        text1: 'Ingénieur passionné et développeur full-stack, je conçois des solutions numériques innovantes qui fusionnent design moderne et performance technique. Mon approche combine expertise en développement web, systèmes embarqués et intelligence artificielle.',
        text2: 'Spécialisé dans la création d\'expériences utilisateur exceptionnelles, je transforme des concepts complexes en interfaces intuitives et élégantes. Chaque projet est une opportunité d\'explorer de nouvelles technologies et de repousser les limites de l\'innovation numérique.',
        contact: 'Me Contacter'
      },
      skills: {
        title: 'Compétences',
        description: 'Un ensemble de compétences techniques et créatives pour donner vie à vos projets les plus ambitieux avec excellence et précision.'
      },
      education: {
        title: 'Parcours Scolaire'
      },
      certifications: {
        title: 'Certifications'
      },
      footer: {
        rights: '© 2025 Tous droits réservés',
        views: 'Visiteurs'
      }
    },
    en: {
      hero: {
        title: ['Solutions', 'Creations', 'Innovations', 'Experiences'],
        subtitle: 'Discover an immersive experience',
        explore: 'Explore'
      },
      nav: {
        home: 'Home',
        projects: 'Projects',
        about: 'About',
        skills: 'Skills'
      },
      projects: {
        title: 'My Projects',
        description: 'Discover my achievements and projects that combine creativity, technique and innovation to create unique and memorable digital experiences.'
      },
      about: {
        title: 'About',
        text1: 'Passionate engineer and full-stack developer, I design innovative digital solutions that merge modern design with technical performance. My approach combines expertise in web development, embedded systems and artificial intelligence.',
        text2: 'Specialized in creating exceptional user experiences, I transform complex concepts into intuitive and elegant interfaces. Each project is an opportunity to explore new technologies and push the boundaries of digital innovation.',
        contact: 'Contact Me'
      },
      skills: {
        title: 'Skills',
        description: 'A set of technical and creative skills to bring your most ambitious projects to life with excellence and precision.'
      },
      education: {
        title: 'Education'
      },
      certifications: {
        title: 'Certifications'
      },
      footer: {
        rights: '© 2025 All rights reserved',
        views: 'Visitors'
      }
    }
  };

  const t = translations[language];

  const dockItems = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: t.nav.home,
      onClick: () => scrollToSection('home')
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      label: t.nav.projects,
      onClick: () => scrollToSection('projects')
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      label: t.nav.about,
      onClick: () => scrollToSection('about')
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      label: t.nav.skills,
      onClick: () => scrollToSection('skills')
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
        </svg>
      ),
      label: language === 'fr' ? 'Français' : 'English',
      onClick: toggleLanguage
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: language === 'fr' ? 'Contact' : 'Contact',
      onClick: () => setIsContactOpen(true)
    }
  ];

  const projects = [
    {
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      images: [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'
      ],
      title: 'Plateforme de Gestion Intelligente',
      subtitle: 'Application Web Full-Stack',
      handle: '@smart-platform',
      date: '2024',
      duration: '4 mois',
      borderColor: '#3B82F6',
      gradient: 'linear-gradient(145deg, #3B82F6, #000)',
      url: 'https://github.com',
      demo: 'https://demo.com',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
      description: 'Plateforme de gestion intelligente permettant aux entreprises de centraliser leurs opérations. Interface moderne avec dashboard en temps réel, système de notifications push, et analytics avancés. Architecture microservices garantissant scalabilité et performance.',
      features: [
        'Dashboard interactif avec graphiques en temps réel',
        'Système de notifications multi-canal (email, SMS, push)',
        'Gestion des utilisateurs et rôles avec authentification JWT',
        'API REST documentée avec Swagger',
        'Système de cache distribué avec Redis',
        'Tests automatisés (unitaires, intégration, E2E)',
        'CI/CD avec GitHub Actions et déploiement automatique',
        'Monitoring et logging avec ELK Stack'
      ]
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800'
      ],
      title: 'E-Shop Premium',
      subtitle: 'Plateforme E-commerce Complète',
      handle: '@e-shop',
      date: '2024',
      duration: '5 mois',
      borderColor: '#10B981',
      gradient: 'linear-gradient(180deg, #10B981, #000)',
      url: 'https://github.com',
      demo: 'https://demo.com',
      technologies: ['Vue.js', 'Nuxt.js', 'Express', 'MongoDB', 'Stripe', 'AWS S3'],
      description: 'Solution e-commerce complète avec gestion avancée des produits, panier intelligent, système de paiement sécurisé Stripe, et tableau de bord vendeur. Architecture optimisée pour le SEO avec rendu côté serveur (SSR).',
      features: [
        'Catalogue produits avec filtres avancés et recherche intelligente',
        'Panier persistant avec recommandations personnalisées',
        'Paiement sécurisé multi-devises via Stripe',
        'Espace vendeur avec statistiques détaillées',
        'Gestion des stocks en temps réel',
        'Système de reviews et notations',
        'Programme de fidélité et codes promo',
        'Intégration avec services de livraison (tracking)'
      ]
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800'
      ],
      title: 'DataViz Pro',
      subtitle: 'Dashboard Analytique Avancé',
      handle: '@dataviz',
      date: '2023',
      duration: '3 mois',
      borderColor: '#F59E0B',
      gradient: 'linear-gradient(165deg, #F59E0B, #000)',
      url: 'https://github.com',
      technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'Pandas', 'WebSocket'],
      description: 'Tableau de bord analytique professionnel avec visualisations interactives en temps réel. Traitement de données massives côté backend avec Python/Pandas, et rendu optimisé des graphiques avec D3.js. Connexion WebSocket pour mises à jour instantanées.',
      features: [
        'Graphiques interactifs personnalisables (courbes, barres, camemberts, heatmaps)',
        'Mises à jour en temps réel via WebSocket',
        'Export des données (CSV, Excel, PDF)',
        'Filtres dynamiques et drill-down',
        'Comparaison de périodes et tendances',
        'Alertes automatiques sur seuils critiques',
        'API Python pour traitement de données complexes',
        'Interface responsive adaptée tablettes et mobiles'
      ]
    },
    {
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
        'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800'
      ],
      title: 'MobileHub',
      subtitle: 'Application Mobile Cross-Platform',
      handle: '@mobilehub',
      date: '2023',
      duration: '6 mois',
      borderColor: '#EF4444',
      gradient: 'linear-gradient(195deg, #EF4444, #000)',
      url: 'https://github.com',
      technologies: ['React Native', 'Expo', 'Firebase', 'Redux', 'TypeScript'],
      description: 'Application mobile moderne avec synchronisation cloud en temps réel, notifications push, et mode hors-ligne. Architecture Redux pour gestion d\'état prévisible. Déploiement iOS et Android depuis une base de code unique.',
      features: [
        'Synchronisation cloud automatique et instantanée',
        'Mode hors-ligne avec stockage local sécurisé',
        'Notifications push personnalisées',
        'Authentification biométrique (Face ID, Touch ID)',
        'Partage de contenu entre utilisateurs',
        'Géolocalisation et cartes interactives',
        'Chat en temps réel avec images et fichiers',
        'Performance optimisée avec code natif pour animations'
      ]
    },
    {
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      images: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        'https://images.unsplash.com/photo-1545665277-5937489579f2?w=800'
      ],
      title: 'Portfolio Immersif',
      subtitle: 'Site Web Interactif & Moderne',
      handle: '@portfolio',
      date: '2024',
      duration: '2 mois',
      borderColor: '#8B5CF6',
      gradient: 'linear-gradient(225deg, #8B5CF6, #000)',
      url: 'https://github.com',
      demo: 'https://demo.com',
      technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'GSAP'],
      description: 'Portfolio créatif avec animations fluides et effets 3D immersifs. Optimisé pour les performances avec Next.js (SSG/SSR), animations avancées avec Framer Motion et GSAP, et rendu 3D interactif avec Three.js.',
      features: [
        'Animations de page fluides et cinématiques',
        'Modèles 3D interactifs avec Three.js',
        'Mode sombre/clair avec transitions douces',
        'Galerie de projets avec filtres dynamiques',
        'Formulaire de contact avec validation',
        'SEO optimisé avec métadonnées dynamiques',
        'Performance score 95+ sur Lighthouse',
        'Totalement responsive et accessible (WCAG AA)'
      ]
    },
    {
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
      images: [
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800'
      ],
      title: 'CloudAPI Gateway',
      subtitle: 'API Backend Scalable',
      handle: '@cloudapi',
      date: '2024',
      duration: '4 mois',
      borderColor: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4, #000)',
      url: 'https://github.com',
      technologies: ['Node.js', 'GraphQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
      description: 'API Gateway haute performance avec architecture microservices. GraphQL pour requêtes flexibles, PostgreSQL pour données relationnelles, Redis pour cache, et déploiement containerisé sur Kubernetes. Rate limiting, authentification OAuth2, et monitoring complet.',
      features: [
        'API GraphQL avec schéma typé et playground',
        'Authentification OAuth2 et JWT',
        'Rate limiting et throttling par utilisateur',
        'Cache distribué multicouche (Redis, CDN)',
        'Base de données PostgreSQL avec réplication',
        'Containerisation Docker et orchestration Kubernetes',
        'Load balancing et auto-scaling',
        'Monitoring avec Prometheus et Grafana',
        'Documentation interactive avec GraphQL Playground',
        'Tests de charge et benchmarking automatisés'
      ]
    }
  ];

  const skillCategories = {
    'Développement Web': [
      { name: 'React', level: 95, icon: '⚛️', color: 'rgba(97, 218, 251, 0.2)' },
      { name: 'JavaScript', level: 90, icon: '📜', color: 'rgba(247, 223, 30, 0.2)' },
      { name: 'TypeScript', level: 82, icon: '📘', color: 'rgba(49, 120, 198, 0.2)' },
      { name: 'CSS/SASS', level: 88, icon: '🎨', color: 'rgba(204, 103, 166, 0.2)' },
      { name: 'Next.js', level: 85, icon: '▲', color: 'rgba(0, 0, 0, 0.2)' }
    ],
    'Backend & Database': [
      { name: 'Node.js', level: 85, icon: '🟢', color: 'rgba(104, 160, 99, 0.2)' },
      { name: 'MongoDB', level: 80, icon: '🍃', color: 'rgba(71, 162, 72, 0.2)' },
      { name: 'PostgreSQL', level: 75, icon: '🐘', color: 'rgba(51, 103, 145, 0.2)' },
      { name: 'Express', level: 82, icon: '🚂', color: 'rgba(64, 64, 64, 0.2)' }
    ],
    'Embedded Systems': [
      { name: 'Arduino', level: 78, icon: '🔌', color: 'rgba(0, 129, 132, 0.2)' },
      { name: 'Raspberry Pi', level: 72, icon: '🍓', color: 'rgba(199, 44, 65, 0.2)' },
      { name: 'C/C++', level: 70, icon: '⚙️', color: 'rgba(0, 89, 157, 0.2)' },
      { name: 'Python', level: 80, icon: '🐍', color: 'rgba(55, 118, 171, 0.2)' }
    ],
    'DevOps & Tools': [
      { name: 'Git', level: 92, icon: '🔀', color: 'rgba(240, 80, 50, 0.2)' },
      { name: 'Docker', level: 70, icon: '🐳', color: 'rgba(33, 150, 243, 0.2)' },
      { name: 'CI/CD', level: 68, icon: '🔄', color: 'rgba(100, 100, 255, 0.2)' },
      { name: 'AWS', level: 65, icon: '☁️', color: 'rgba(255, 153, 0, 0.2)' }
    ]
  };

  const educationMenuItems = [
    {
      link: '#',
      text: 'BTS SNIR 2023-2025',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'
    },
    {
      link: '#',
      text: 'Bac Pro SN 2021-2023',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop'
    }
  ];

  const certifications = [
    { name: 'AWS Certified Developer', year: '2024', icon: '☁️' },
    { name: 'React Advanced Patterns', year: '2024', icon: '⚛️' },
    { name: 'Node.js Professional', year: '2023', icon: '🟢' },
  ];

  if (loading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              pointerEvents: 'none'
            }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: '60%',
              maxWidth: '500px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.9) 80%, rgba(255,255,255,1) 100%)',
                  position: 'relative'
                }}
              >
                <motion.div
                  animate={{
                    opacity: [1, 0.7, 1],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 70%)',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1rem',
              fontWeight: 300,
              letterSpacing: '0.2em',
              zIndex: 1
            }}
          >
            {loadingProgress}%
          </motion.p>
        </motion.div>
    );
  }

  return (
    <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, auto !important;
        }

        body {
          font-family: 'Olympic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #0a0a0a;
          color: #fff;
          overflow-x: hidden;
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, auto !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-weight: 300;
          letter-spacing: -0.01em;
        }

        a, button {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, pointer !important;
        }

        ::selection {
          background-color: rgba(74, 222, 128, 0.3);
          color: #ffffff;
        }

        .shiny-text {
          color: #ffffff;
          background: linear-gradient(
            120deg,
            #ffffff 0%,
            #ffffff 35%,
            rgba(255, 255, 255, 0.3) 45%,
            #ffffff 55%,
            #ffffff 65%,
            #ffffff 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          animation: shine 3s linear infinite;
        }

        @keyframes shine {
          0% { background-position: 100%; }
          100% { background-position: -100%; }
        }

        .shiny-text.disabled {
          animation: none;
        }

        /* Scroll to Top Button */
        .scroll-to-top-btn {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(100, 100, 100, 0.8), rgba(60, 60, 60, 0.8));
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .scroll-to-top-btn:hover {
          background: linear-gradient(135deg, rgba(140, 140, 140, 0.9), rgba(100, 100, 100, 0.9));
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 30px rgba(255, 255, 255, 0.15);
        }

        /* Dock Styles */
        .dock-outer {
          margin: 0 0.5rem;
          display: flex;
          max-width: 100%;
          align-items: center;
        }

        .dock-panel {
          position: fixed;
          bottom: 0.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: flex-end;
          width: fit-content;
          gap: 1rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(20, 20, 20, 0.95));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1rem 0.75rem;
          z-index: 10000;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6),
                      0 0 100px rgba(255, 255, 255, 0.1);
          opacity: 1;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .dock-panel.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(100px);
          pointer-events: none;
        }

        .dock-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(80, 80, 80, 0.3), rgba(50, 50, 50, 0.3));
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          outline: none;
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.9);
        }

        .dock-item:hover {
          background: linear-gradient(135deg, rgba(120, 120, 120, 0.4), rgba(80, 80, 80, 0.4));
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
        }

        .dock-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dock-label {
          position: absolute;
          top: -2.5rem;
          left: 50%;
          width: fit-content;
          white-space: pre;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, rgba(60, 60, 60, 0.95), rgba(40, 40, 40, 0.95));
          backdrop-filter: blur(10px);
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          color: #fff;
          transform: translateX(-50%);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .scroll-reveal {
          margin: 20px 0;
        }

        .scroll-reveal-text {
          font-size: clamp(1.6rem, 4vw, 3rem);
          line-height: 1.5;
          font-weight: 600;
        }

        .word {
          display: inline-block;
        }

        .video-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          padding-top: 0;
        }

        .video-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          bottom: 8rem;
          left: 4rem;
          text-align: left;
          z-index: 10;
          max-width: 70%;
        }

        .rotating-text-hero {
          display: inline-flex;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .video-overlay h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          font-family: 'Poppins', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(200, 200, 200, 0.85));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* RotatingText avec fond */
        .rotating-title-wrapper {
          display: inline-flex;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          min-height: 4.5rem;
          min-width: 320px;
          align-items: center;
          justify-content: center;
        }

        .rotating-title {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        /* Header Animation */
        .animated-header {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .animated-header.hidden {
          opacity: 0;
          transform: translateY(-30px);
          pointer-events: none;
        }

        .content-section {
          min-height: 100vh;
          padding: 16rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
        }

        .dither-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          opacity: 0.15;
          pointer-events: none;
        }

        .btn-shiny {
          padding: 1rem 2.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-size: 1.1rem;
          font-weight: 500;
          margin: 1rem;
        }

        .btn-shiny:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .scroll-mouse {
          width: 35px;
          height: 55px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          border-radius: 18px;
          position: relative;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3),
                      inset 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .scroll-wheel {
          width: 5px;
          height: 12px;
          background: rgba(255, 255, 255, 1);
          border-radius: 3px;
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: scroll-wheel 2s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        @keyframes scroll-wheel {
          0%, 100% {
            opacity: 1;
            top: 8px;
          }
          50% {
            opacity: 0.5;
            top: 25px;
          }
        }

        .scroll-text {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .about-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 4rem;
          align-items: start;
          width: 100%;
          max-width: 1600px;
          margin: 5rem auto;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(50, 50, 50, 0.6), rgba(40, 40, 40, 0.7));
          border: 1px solid rgba(100, 100, 100, 0.2);
          border-radius: 2rem;
          position: relative;
          overflow: hidden;
        }

        .about-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(100, 100, 100, 0.1), transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(80, 80, 80, 0.1), transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .about-container > * {
          position: relative;
          z-index: 1;
        }

        .about-content-left {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .about-text-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .about-paragraph {
          font-size: 1.2rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .about-3d-section {
          position: sticky;
          top: 100px;
          width: 100%;
          height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-number span {
          font-size: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .stat-label {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .education-timeline {
          width: 100%;
          max-width: 1200px;
          margin: 5rem auto;
          position: relative;
        }

        .education-timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-50%);
        }

        .education-item {
          display: flex;
          align-items: center;
          margin: 4rem 0;
          position: relative;
        }

        .education-item:nth-child(odd) {
          flex-direction: row;
        }

        .education-item:nth-child(even) {
          flex-direction: row-reverse;
        }

        .education-content {
          flex: 1;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          margin: 0 2rem;
        }

        .education-year {
          font-size: 2rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.5rem;
        }

        .education-degree {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .education-school {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
        }

        /* Certifications - Style Moderne et Épuré */
        .certifications-horizontal {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2.5rem;
          width: 100%;
          max-width: 1400px;
          margin: 5rem auto;
          padding: 2rem 1rem;
        }

        .certification-badge {
          position: relative;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(40, 35, 20, 0.6), rgba(30, 25, 15, 0.5));
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 24px;
          padding: 3rem 2rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .certification-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg,
            rgba(255, 215, 0, 0.8),
            rgba(212, 175, 55, 0.9),
            rgba(184, 134, 11, 0.8));
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .certification-badge:hover::before {
          opacity: 1;
        }

        .certification-badge:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(212, 175, 55, 0.6);
          background: linear-gradient(135deg, rgba(50, 42, 25, 0.8), rgba(35, 30, 18, 0.7));
          box-shadow: 0 25px 70px rgba(212, 175, 55, 0.2), 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .certification-medal {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .certification-logo-container {
          width: 100px;
          height: 100px;
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(212, 175, 55, 0.05));
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 1.25rem;
          transition: all 0.4s ease;
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.1), 0 0 40px rgba(212, 175, 55, 0.15);
          backdrop-filter: blur(10px);
        }

        .certification-badge:hover .certification-logo-container {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(212, 175, 55, 0.1));
          border-color: rgba(212, 175, 55, 0.5);
          transform: scale(1.1) rotateY(5deg);
          box-shadow: 0 12px 30px rgba(212, 175, 55, 0.25);
        }

        .certification-logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(1.2) contrast(1.1) drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3));
        }

        .certification-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }

        .certification-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.4;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.2);
        }

        .certification-year {
          font-size: 1.1rem;
          color: rgba(212, 175, 55, 0.8);
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 50px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .skills-categories-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          width: 100%;
          max-width: 1800px;
          margin: 5rem auto;
        }

        .skills-category {
          width: 100%;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          transition: all 0.4s ease;
          min-height: 400px;
        }

        .skills-category[data-category="web"]:hover {
          border-color: rgba(97, 218, 251, 0.6);
          background: rgba(97, 218, 251, 0.05);
          box-shadow: 0 0 40px rgba(97, 218, 251, 0.3);
        }

        .skills-category[data-category="backend"]:hover {
          border-color: rgba(104, 160, 99, 0.6);
          background: rgba(104, 160, 99, 0.05);
          box-shadow: 0 0 40px rgba(104, 160, 99, 0.3);
        }

        .skills-category[data-category="embedded"]:hover {
          border-color: rgba(199, 44, 65, 0.6);
          background: rgba(199, 44, 65, 0.05);
          box-shadow: 0 0 40px rgba(199, 44, 65, 0.3);
        }

        .skills-category[data-category="devops"]:hover {
          border-color: rgba(255, 153, 0, 0.6);
          background: rgba(255, 153, 0, 0.05);
          box-shadow: 0 0 40px rgba(255, 153, 0, 0.3);
        }

        .skills-category-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          width: 100%;
        }

        .skill-card {
          flex: 0 1 auto;
          min-width: 140px;
          max-width: 180px;
          padding: 1.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 0.75rem;
        }

        .skill-card:hover {
          transform: translateY(-5px) scale(1.05);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .skill-name {
          font-weight: 600;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .skill-icon {
          font-size: 2.5rem;
        }

        /* Project Modal */
        .project-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .project-modal-content {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(10, 10, 10, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .project-modal-content::-webkit-scrollbar {
          width: 10px;
        }

        .project-modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .project-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          border: 2px solid rgba(30, 30, 30, 0.95);
        }

        .project-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .modal-image-container {
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
        }

        .modal-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-body {
          padding: 3rem;
        }

        .modal-body h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .modal-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
        }

        .modal-description, .modal-technologies {
          margin: 2rem 0;
        }

        .modal-description h3, .modal-technologies h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tech-tag {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .modal-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
        }

        .modal-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        /* Footer Call to Action Section */
        .footer-cta-section {
          position: relative;
          padding: 6rem 2rem;
          margin-bottom: 4rem;
          background: linear-gradient(135deg, rgba(100, 200, 255, 0.05), rgba(180, 120, 255, 0.05));
          border: 2px solid rgba(212, 175, 55, 0.2);
          border-radius: 30px;
          overflow: hidden;
          backdrop-filter: blur(5px);
          transition: all 0.4s ease;
        }

        .footer-cta-section:hover {
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.15), inset 0 0 40px rgba(212, 175, 55, 0.05);
        }

        .footer-cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(100, 200, 255, 0.1), transparent 70%);
          pointer-events: none;
        }

        .footer-cta-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 100% 100%, rgba(180, 120, 255, 0.1), transparent 60%);
          pointer-events: none;
        }

        .footer-cta-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-cta-text {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.5;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(212, 175, 55, 0.85));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2.5rem;
          letter-spacing: -0.02em;
          animation: textGlow 3s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
          }
          50% {
            text-shadow: 0 8px 30px rgba(212, 175, 55, 0.35);
          }
        }

        .footer-cta-button {
          display: inline-block;
          margin-top: 1rem;
        }

        .footer-cta-button button {
          font-size: 1.1rem;
          padding: 1.2rem 3rem;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
        }

        .footer-cta-button button:hover {
          transform: scale(1.05);
        }

        /* Footer */
        .site-footer {
          background: #0a0a0a;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 5rem 0;
          text-align: center;
          margin-top: 10rem;
          margin-bottom: 0;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          position: relative;
        }

        .site-footer::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0;
          background: #0a0a0a;
          z-index: -1;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Spotlight CTA Card */
        .footer-spotlight-cta {
          background: linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(15, 15, 25, 0.9)) !important;
          border: 1px solid rgba(255, 215, 0, 0.2) !important;
          margin-bottom: 4rem;
        }

        .footer-cta-simple {
          text-align: center;
          position: relative;
          z-index: 1;
          margin-bottom: 4rem;
          background: transparent;
          border: none;
          padding: 2rem;
        }

        .footer-cta-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .footer-cta-text {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 255, 255, 0.6));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-cta-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .footer-cta-button {
          display: inline-block;
        }

        /* Stats Grid */
        .footer-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .footer-stat-card {
          background: linear-gradient(135deg, rgba(20, 20, 30, 0.7), rgba(15, 15, 25, 0.8)) !important;
          border: 1px solid rgba(100, 200, 255, 0.1) !important;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-stat {
          text-align: center;
          width: 100%;
        }

        .footer-stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.8), rgba(138, 43, 226, 0.6));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-stat-label {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Links Grid */
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
        }

        .footer-link-card {
          background: linear-gradient(135deg, rgba(20, 20, 30, 0.6), rgba(15, 15, 25, 0.7)) !important;
          border: 1px solid rgba(100, 100, 100, 0.1) !important;
          min-height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-link-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          padding: 1rem;
          width: 100%;
          font-size: inherit;
        }

        .footer-link-content:hover {
          color: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }

        .footer-link-icon {
          font-size: 1.8rem;
        }

        .footer-link-text {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.95rem;
        }

        .footer-copyright {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        /* Responsive Tablet */
        @media (max-width: 1024px) {
          .about-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 0 1.5rem;
          }

          .about-3d-section {
            position: relative;
            top: 0;
            height: 400px;
          }

          .about-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }

          .stat-card {
            padding: 1.5rem 1rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .stat-icon {
            font-size: 2rem;
          }

          .footer-cta-text {
            font-size: 1.8rem;
          }

          .footer-stats-grid {
            grid-template-columns: 1fr;
          }

          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          }
        }

        /* Responsive Mobile */
        @media (max-width: 768px) {
          .video-overlay {
            bottom: 6rem;
            left: 2rem;
            right: 2rem;
            text-align: left;
            max-width: none;
          }

          .rotating-title-wrapper {
            padding: 0.4rem 1rem;
          }

          .about-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .about-stats {
            grid-template-columns: 1fr;
          }

          .about-3d-section {
            position: relative;
            top: 0;
          }

          .education-timeline::before {
            left: 20px;
          }

          .education-item {
            flex-direction: row !important;
            padding-left: 50px;
          }

          .education-content {
            margin: 0 0 0 1rem;
          }

          .content-section {
            padding: 8rem 1.5rem;
          }

          .skills-categories-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin: 3rem auto;
          }

          .skills-category {
            padding: 1.5rem;
          }

          .skills-category-title {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 640px) {
          .skills-categories-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin: 2rem auto;
          }

          .about-paragraph {
            font-size: 1rem;
            line-height: 1.6;
          }

          .stat-card {
            padding: 1.25rem 1rem;
          }

          .stat-number {
            font-size: 1.8rem;
          }

          .stat-icon {
            font-size: 1.8rem;
          }

          .stat-label {
            font-size: 0.85rem;
          }

          .about-3d-section {
            height: 350px;
          }

          .footer-stats {
            flex-direction: column;
            gap: 2rem;
          }

          .footer-cta-text {
            font-size: 1.4rem;
            line-height: 1.4;
          }

          .footer-cta-section {
            padding: 3rem 1.2rem;
            margin-bottom: 2rem;
            border-radius: 20px;
          }

          .footer-cta-button button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .modal-body {
            padding: 2rem 1.5rem;
          }

          .modal-body h2 {
            font-size: 1.8rem;
          }

          .modal-links {
            flex-direction: column;
          }

          .certifications-horizontal {
            justify-content: flex-start;
          }

          /* Dock mobile improvements */
          .dock-panel {
            bottom: 0.25rem;
            gap: 0.5rem;
            padding: 0 0.25rem 0.25rem;
            border-radius: 0.75rem;
          }

          .dock-item {
            border-radius: 8px;
          }

          .scroll-to-top-btn {
            bottom: 5rem;
            right: 1rem;
            width: 45px;
            height: 45px;
          }
        }

        @media (max-width: 480px) {
          .video-overlay h1 {
            font-size: clamp(2rem, 6vw, 3rem) !important;
          }

          .rotating-title-wrapper {
            padding: 0.3rem 0.75rem;
            font-size: 0.9em;
          }

          .btn-shiny {
            padding: 0.875rem 2rem;
            font-size: 1rem;
          }

          .dock-panel {
            gap: 0.4rem;
            padding: 0 0.2rem 0.2rem;
          }

          .content-section {
            padding: 6rem 1rem;
          }

          .scroll-to-top-btn {
            width: 40px;
            height: 40px;
          }
        }

        .grid-3d-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
          background:
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .02) 25%, rgba(255, 255, 255, .02) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .02) 75%, rgba(255, 255, 255, .02) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .02) 25%, rgba(255, 255, 255, .02) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .02) 75%, rgba(255, 255, 255, .02) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .dock-panel-wrapper.hidden .dock-panel {
          opacity: 0;
          transform: translateX(-50%) translateY(100px);
          pointer-events: none;
        }
      `}</style>

      <div className="grid-3d-background" />

      <div className="dither-background">
        <Dither
          waveColor={[1, 1, 1]}
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.3}
          colorNum={2}
          waveAmplitude={0.5}
          waveFrequency={5}
          waveSpeed={0.1}
          pixelSize={3}
        />
      </div>

      <Header isVisible={!isScrolledPastHero} language={language} onLanguageToggle={toggleLanguage} />
      <ContactCard isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {showTransition && (
        <SplitTransition onComplete={() => setShowTransition(false)} />
      )}

      <div className="video-container" id="home">
        <video autoPlay loop muted playsInline>
          <source src="assets/circuit.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <motion.p
            style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 2.8, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ScrambleText
              text={t.hero.subtitle}
              delay={3100}
            />
          </motion.p>
          <motion.h1
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', marginTop: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ScrambleText
              text="CONCEPTEUR DE"
              delay={3500}
            />
            {' '}
            <RotatingText
              texts={['Solutions', 'Créations']}
              rotationInterval={2000}
              staggerDuration={0.025}
              staggerFrom="last"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              mainClassName="rotating-text-hero"
              splitLevelClassName="pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          </motion.h1>
        </div>
        <motion.div
          className="scroll-indicator"
          onClick={() => scrollToSection('projects')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.4, ease: 'easeOut' }}
        >
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span className="scroll-text"><ShinyText text="Scroll" speed={4} /></span>
        </motion.div>
      </div>

      <div className="content-section" id="projects">
        <AnimatedSection>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem', textAlign: 'center' }}>
            <ShinyText text={t.projects.title} speed={4} />
          </h2>
          <ScrollReveal>
            <ShinyText text={t.projects.description} speed={6} />
          </ScrollReveal>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div style={{ minHeight: '800px', height: 'auto', position: 'relative', width: '100%', marginTop: '5rem' }}>
            <ProjectGrid projects={projects} onProjectClick={(project) => setSelectedProject(project)} />
          </div>
        </AnimatedSection>
      </div>

      {/* Modal de projet */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <div className="content-section" id="about">
        <AnimatedSection>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem', textAlign: 'center' }}>
            <ShinyText text={t.about.title} speed={4} />
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="about-container">
            <div className="about-content-left">
              <div className="about-text-section">
                <ScrollReveal as="p" containerClassName="about-paragraph">
                  {t.about.text1}
                </ScrollReveal>
                <ScrollReveal as="p" containerClassName="about-paragraph">
                  {t.about.text2}
                </ScrollReveal>
              </div>

              <motion.div
                className="about-stats"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon">💼</div>
                  <div className="stat-number">
                    <CountUp to={50} duration={2} />
                    <span>+</span>
                  </div>
                  <span className="stat-label"><ShinyText text="Projets Réalisés" speed={5} /></span>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon">⚡</div>
                  <div className="stat-number">
                    <CountUp to={5} duration={2} />
                    <span>+</span>
                  </div>
                  <span className="stat-label"><ShinyText text="Années d'Expérience" speed={5} /></span>
                </motion.div>

                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon">🚀</div>
                  <div className="stat-number">
                    <CountUp to={15} duration={2} />
                    <span>+</span>
                  </div>
                  <span className="stat-label"><ShinyText text="Technologies Maîtrisées" speed={5} /></span>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="about-3d-section"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Model3DViewer />
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '3rem', textAlign: 'center', marginTop: '10rem' }}>
            <ShinyText text={t.education.title} speed={4} />
          </h2>
          <div style={{ height: '600px', position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', padding: '0' }}>
            <FlowingMenu items={educationMenuItems} />
          </div>
        </AnimatedSection>
      </div>

      <div className="content-section" id="skills">
        <AnimatedSection>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem', textAlign: 'center' }}>
            <ShinyText text={t.skills.title} speed={4} />
          </h2>
          <ScrollReveal>
            <ShinyText text={t.skills.description} speed={6} />
          </ScrollReveal>
        </AnimatedSection>

        <div className="skills-categories-container">
          {Object.entries(skillCategories).map(([category, skills], catIndex) => {
            const categorySlug = category.toLowerCase().includes('web') ? 'web' :
                                 category.toLowerCase().includes('backend') ? 'backend' :
                                 category.toLowerCase().includes('embedded') ? 'embedded' : 'devops';

            return (
              <motion.div
                key={category}
                className="skills-category"
                data-category={categorySlug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
              >
                <h3 className="skills-category-title">
                  <ShinyText text={category} speed={4} />
                </h3>
                <div className="skills-grid">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <TiltedCard
                        imageSrc={techLogos[skill.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.name)}&size=200&background=333&color=fff`}
                        altText={skill.name}
                        captionText={skill.name}
                        containerHeight="120px"
                        containerWidth="120px"
                        imageHeight="120px"
                        imageWidth="120px"
                        rotateAmplitude={10}
                        scaleOnHover={1.12}
                        showMobileWarning={false}
                        showTooltip={true}
                        displayOverlayContent={false}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatedSection delay={0.6}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '3rem', textAlign: 'center', marginTop: '10rem' }}>
            <ShinyText text={t.certifications.title} speed={4} />
          </h2>
          <div className="certifications-horizontal">
            {certifications.map((cert, index) => {
              const certLogoMap = {
                'AWS Certified Developer': 'AWS',
                'React Advanced Patterns': 'React',
                'Node.js Professional': 'Node.js'
              };
              const logoKey = certLogoMap[cert.name];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <PixelCard variant="gold">
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', zIndex: 1 }}>
                      <div className="certification-logo-container" style={{ marginBottom: '1rem' }}>
                        <img
                          src={logoKey && techLogos[logoKey] ? techLogos[logoKey] : `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg`}
                          alt={cert.name}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'brightness(1.2)' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center', color: '#d4af37' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}><ShinyText text={cert.name} speed={5} /></div>
                        <div style={{ fontSize: '1rem', opacity: 0.8 }}><ShinyText text={cert.year} speed={5} /></div>
                      </div>
                    </div>
                  </PixelCard>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          {/* CTA Section avec Spotlight */}
          <AnimatedSection>
            <div className="footer-cta-simple">
              <div className="footer-cta-content">
                <h2 className="footer-cta-text">
                  <ScrollReveal>
                    Prêt à transformer votre vision en réalité ?
                  </ScrollReveal>
                </h2>
              </div>
            </div>
          </AnimatedSection>

          {/* Stats Section */}
          <AnimatedSection delay={0.2}>
            <div className="footer-stats-grid">
              <SpotlightCard className="footer-stat-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                <div className="footer-stat">
                  <div className="footer-stat-value">
                    <Counter
                      value={1247}
                      places={[1000, 100, 10, 1]}
                      fontSize={45}
                      padding={5}
                      gap={8}
                      textColor="white"
                      fontWeight={900}
                    />
                  </div>
                  <div className="footer-stat-label"><ShinyText text={t.footer.views} speed={6} /></div>
                </div>
              </SpotlightCard>

              <SpotlightCard className="footer-stat-card" spotlightColor="rgba(138, 43, 226, 0.2)">
                <div className="footer-stat">
                  <div className="footer-stat-value">
                    <Counter
                      value={24}
                      places={[10, 1]}
                      fontSize={45}
                      padding={5}
                      gap={8}
                      textColor="white"
                      fontWeight={900}
                    />
                  </div>
                  <div className="footer-stat-label"><ShinyText text="Projets" speed={6} /></div>
                </div>
              </SpotlightCard>

              <SpotlightCard className="footer-stat-card" spotlightColor="rgba(0, 255, 127, 0.2)">
                <div className="footer-stat">
                  <div className="footer-stat-value">
                    <Counter
                      value={5}
                      places={[1]}
                      fontSize={45}
                      padding={5}
                      gap={8}
                      textColor="white"
                      fontWeight={900}
                    />
                  </div>
                  <div className="footer-stat-label"><ShinyText text="Années d'expérience" speed={6} /></div>
                </div>
              </SpotlightCard>
            </div>
          </AnimatedSection>

          {/* Links Section */}
          <AnimatedSection delay={0.4}>
            <div className="footer-links-grid">
              <SpotlightCard className="footer-link-card" spotlightColor="rgba(255, 165, 0, 0.2)">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link-content">
                  <span className="footer-link-icon">💻</span>
                  <span className="footer-link-text"><ShinyText text="GitHub" speed={5} /></span>
                </a>
              </SpotlightCard>

              <SpotlightCard className="footer-link-card" spotlightColor="rgba(30, 144, 255, 0.2)">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link-content">
                  <span className="footer-link-icon">💼</span>
                  <span className="footer-link-text"><ShinyText text="LinkedIn" speed={5} /></span>
                </a>
              </SpotlightCard>

              <SpotlightCard className="footer-link-card" spotlightColor="rgba(220, 20, 60, 0.2)">
                <a href="mailto:contact@example.com" className="footer-link-content">
                  <span className="footer-link-icon">📧</span>
                  <span className="footer-link-text"><ShinyText text="Email" speed={5} /></span>
                </a>
              </SpotlightCard>

              <SpotlightCard className="footer-link-card" spotlightColor="rgba(255, 215, 0, 0.2)">
                <button type="button" className="footer-link-content" onClick={() => window.open('/cv.pdf', '_blank')}>
                  <span className="footer-link-icon">📄</span>
                  <span className="footer-link-text"><ShinyText text="CV" speed={5} /></span>
                </button>
              </SpotlightCard>
            </div>
          </AnimatedSection>

          {/* Copyright Section */}
          <AnimatedSection delay={0.6}>
            <div className="footer-copyright">
              <p><ShinyText text={t.footer.rights} speed={6} /></p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <ShinyText text="Made with ❤️ using React, GSAP, Framer Motion & Three.js" speed={6} />
              </p>
            </div>
          </AnimatedSection>
        </div>
      </footer>

      <div className={!isScrolledPastHero ? 'dock-panel-wrapper hidden' : 'dock-panel-wrapper'}>
        <Dock items={dockItems} />
      </div>
      <ScrollToTopButton show={showScrollTop} />
    </>
  );
}
