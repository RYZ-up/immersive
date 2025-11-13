
# 🌟 Site Immersif - Instructions d'Installation

## 📋 Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

## 🚀 Installation

### Étape 1 : Créer le dossier du projet
```bash
mkdir mon-site-immersif
cd mon-site-immersif
```

### Étape 2 : Copier tous les fichiers
Copiez tous les fichiers téléchargés dans ce dossier :
- `package.json`
- `index.js`
- `App.js`
- `ImmersiveWebsite.jsx`
- `public/index.html`

La structure doit ressembler à :
```
mon-site-immersif/
├── package.json
├── index.js
├── App.js
├── ImmersiveWebsite.jsx
└── public/
    └── index.html
```

### Étape 3 : Installer les dépendances
```bash
npm install
```

### Étape 4 : Lancer le projet
```bash
npm start
```

Le site s'ouvrira automatiquement dans votre navigateur à l'adresse `http://localhost:3000`

## 🎨 Personnalisation

### Changer la vidéo
Dans `ImmersiveWebsite.jsx`, ligne ~800, remplacez l'URL de la vidéo :
```jsx
<source src="VOTRE_URL_VIDEO.mp4" type="video/mp4" />
```

### Modifier les couleurs du curseur
Dans la fonction `generateColor()` (ligne ~650), ajustez les valeurs :
```javascript
const brightness = 0.15 + Math.random() * 0.15; // Augmentez pour plus de luminosité
```

### Ajouter des sections
Dupliquez un bloc `<div className="content-section">` et ajoutez votre contenu avec `<ScrollReveal>`.

## 🛠️ Commandes disponibles

- `npm start` - Lance le serveur de développement
- `npm run build` - Crée une version optimisée pour la production
- `npm test` - Lance les tests

## 📦 Dépendances principales

- **React** - Framework UI
- **motion** (Framer Motion) - Animations fluides
- **gsap** - Animations de scroll avancées

## 🎯 Fonctionnalités

✅ Écran de chargement animé
✅ Vidéo plein écran avec overlay
✅ Texte avec effet brillant (ShinyText)
✅ Curseur fluide interactif (discret)
✅ Dock macOS en bas de page
✅ Animations au scroll (ScrollReveal)
✅ Design responsive
✅ Sections multiples animées

## 🐛 Résolution de problèmes

**Erreur "Cannot find module"**
→ Assurez-vous d'avoir exécuté `npm install`

**La page est blanche**
→ Vérifiez la console du navigateur (F12) pour voir les erreurs

**Les animations ne fonctionnent pas**
→ Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

## 📱 Support

Le site est optimisé pour :
- Chrome, Firefox, Safari, Edge (dernières versions)
- Mobile et Desktop
- Tous les formats d'écran

## ⚡ Performance

Pour optimiser les performances :
1. Utilisez des vidéos compressées (format .mp4, H.264)
2. Limitez la résolution de la vidéo (1080p max)
3. Considérez l'utilisation d'un CDN pour les assets

Bon développement ! 🚀

aussi je veux que la barre de chargement soit une ligne fine blanche avec un effet de étincelle au bout et je veux que les projets ressemblent a ceci dans le thème npm install gsap



import ChromaGrid from './ChromaGrid'

const items = [

  {

    image: "https://i.pravatar.cc/300?img=1",

    title: "Sarah Johnson",

    subtitle: "Frontend Developer",

    handle: "@sarahjohnson",

    borderColor: "#3B82F6",

    gradient: "linear-gradient(145deg, #3B82F6, #000)",

    url: "https://github.com/sarahjohnson"

  },

  {

    image: "https://i.pravatar.cc/300?img=2",

    title: "Mike Chen",

    subtitle: "Backend Engineer",

    handle: "@mikechen",

    borderColor: "#10B981",

    gradient: "linear-gradient(180deg, #10B981, #000)",

    url: "https://linkedin.com/in/mikechen"

  }

];

<div style={{ height: '600px', position: 'relative' }}>

  <ChromaGrid 

    items={items}

    radius={300}

    damping={0.45}

    fadeOut={0.6}

    ease="power3.out"

  />

</div>





.chroma-grid {

  position: relative;

  width: 100%;

  height: 100%;

  display: grid;

  grid-template-columns: repeat(var(--cols, 3), 320px);

  grid-auto-rows: auto;

  justify-content: center;

  gap: 0.75rem;

  max-width: 1200px;

  margin: 0 auto;

  padding: 1rem;

  box-sizing: border-box;

  --x: 50%;

  --y: 50%;

  --r: 220px;

}

@media (max-width: 1124px) {

  .chroma-grid {

    grid-template-columns: repeat(auto-fit, minmax(320px, 320px));

    gap: 0.5rem;

    padding: 0.5rem;

  }

}

@media (max-width: 480px) {

  .chroma-grid {

    grid-template-columns: 320px;

    gap: 0.75rem;

    padding: 1rem;

  }

}

.chroma-card {

  position: relative;

  display: flex;

  flex-direction: column;

  width: 320px;

  height: auto;

  border-radius: 20px;

  overflow: hidden;

  border: 1px solid #333;

  transition: border-color 0.3s ease;

  background: var(--card-gradient);

  --mouse-x: 50%;

  --mouse-y: 50%;

  --spotlight-color: rgba(255, 255, 255, 0.3);

}

.chroma-card:hover {

  border-color: var(--card-border);

}

.chroma-card::before {

  content: '';

  position: absolute;

  inset: 0;

  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%);

  pointer-events: none;

  opacity: 0;

  transition: opacity 0.5s ease;

  z-index: 2;

}

.chroma-card:hover::before {

  opacity: 1;

}

.chroma-img-wrapper {

  position: relative;

  z-index: 1;

  flex: 1;

  padding: 10px;

  box-sizing: border-box;

  background: transparent;

  transition: background 0.3s ease;

}

.chroma-img-wrapper img {

  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 10px;

  display: block;

}

.chroma-info {

  position: relative;

  z-index: 1;

  padding: 0.75rem 1rem;

  color: #fff;

  font-family: system-ui, sans-serif;

  display: grid;

  grid-template-columns: 1fr auto;

  row-gap: 0.25rem;

  column-gap: 0.75rem;

}

.chroma-info .role,

.chroma-info .handle {

  color: #aaa;

}

.chroma-overlay {

  position: absolute;

  inset: 0;

  pointer-events: none;

  z-index: 3;

  backdrop-filter: grayscale(1) brightness(0.78);

  -webkit-backdrop-filter: grayscale(1) brightness(0.78);

  background: rgba(0, 0, 0, 0.001);

  mask-image: radial-gradient(

    circle var(--r) at var(--x) var(--y),

    transparent 0%,

    transparent 15%,

    rgba(0, 0, 0, 0.1) 30%,

    rgba(0, 0, 0, 0.22) 45%,

    rgba(0, 0, 0, 0.35) 60%,

    rgba(0, 0, 0, 0.5) 75%,

    rgba(0, 0, 0, 0.68) 88%,

    white 100%

  );

  -webkit-mask-image: radial-gradient(

    circle var(--r) at var(--x) var(--y),

    transparent 0%,

    transparent 15%,

    rgba(0, 0, 0, 0.1) 30%,

    rgba(0, 0, 0, 0.22) 45%,

    rgba(0, 0, 0, 0.35) 60%,

    rgba(0, 0, 0, 0.5) 75%,

    rgba(0, 0, 0, 0.68) 88%,

    white 100%

  );

}

.chroma-fade {

  position: absolute;

  inset: 0;

  pointer-events: none;

  z-index: 4;

  backdrop-filter: grayscale(1) brightness(0.78);

  -webkit-backdrop-filter: grayscale(1) brightness(0.78);

  background: rgba(0, 0, 0, 0.001);

  mask-image: radial-gradient(

    circle var(--r) at var(--x) var(--y),

    white 0%,

    white 15%,

    rgba(255, 255, 255, 0.9) 30%,

    rgba(255, 255, 255, 0.78) 45%,

    rgba(255, 255, 255, 0.65) 60%,

    rgba(255, 255, 255, 0.5) 75%,

    rgba(255, 255, 255, 0.32) 88%,

    transparent 100%

  );

  -webkit-mask-image: radial-gradient(

    circle var(--r) at var(--x) var(--y),

    white 0%,

    white 15%,

    rgba(255, 255, 255, 0.9) 30%,

    rgba(255, 255, 255, 0.78) 45%,

    rgba(255, 255, 255, 0.65) 60%,

    rgba(255, 255, 255, 0.5) 75%,

    rgba(255, 255, 255, 0.32) 88%,

    transparent 100%

  );

  opacity: 1;

  transition: opacity 0.25s ease;

}





et lors des compétences mets ceci npx jsrepo add https://reactbits.dev/default/Components/SpotlightCard



import SpotlightCard from './SpotlightCard';

  

<SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">

  // Content goes here

</SpotlightCard>



import { useRef } from 'react';

import './SpotlightCard.css';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {

  const divRef = useRef(null);

  const handleMouseMove = e => {

    const rect = divRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', ${x}px);

    divRef.current.style.setProperty('--mouse-y', ${y}px);

    divRef.current.style.setProperty('--spotlight-color', spotlightColor);

  };

  return (

    <div ref={divRef} onMouseMove={handleMouseMove} className=card-spotlight ${className}}>

      {children}

    </div>

  );

};

export default SpotlightCard;

.card-spotlight {

  position: relative;

  border-radius: 1.5rem;

  border: 1px solid #222;

  background-color: #111;

  padding: 2rem;

  overflow: hidden;

  --mouse-x: 50%;

  --mouse-y: 50%;

  --spotlight-color: rgba(255, 255, 255, 0.05);

}

.card-spotlight::before {

  content: '';

  position: absolute;

  top: 0;

  left: 0;

  right: 0;

  bottom: 0;

  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%);

  opacity: 0;

  transition: opacity 0.5s ease;

  pointer-events: none;

}

.card-spotlight:hover::before,

.card-spotlight:focus-within::before {

  opacity: 0.6;

}





avec des couleurs qui vont avec la compétences aussi je veux que chaque élement soit animé a l'arrivé sur l'écran #   i m m e r s i v e  
 