import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const IAstedButton = () => {
  // États pour les interactions et animations
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Initialiser les animations et suivre la souris
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculer la position de la souris par rapport au centre du conteneur
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      setMousePosition({ x, y });
      
      // Mettre à jour l'inclinaison du bouton en fonction de la position de la souris
      if (buttonRef.current) {
        const tiltAmount = 15; // Augmenté pour un effet 3D plus prononcé
        const glowX = x * 40; // Augmenté pour un effet d'ombre plus prononcé
        const glowY = y * 40;
        
        // Effet 3D plus prononcé avec transformation en Z et rotations multiples
        buttonRef.current.style.transform = `
          perspective(800px) 
          rotateX(${-y * tiltAmount}deg) 
          rotateY(${x * tiltAmount}deg)
          rotateZ(${x * y * 5}deg)
          translateZ(20px)
          scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, ${isHovered ? 1.2 : 1})
          ${isClicked ? 'scale3d(0.95, 0.95, 0.9)' : ''}
        `;
        
        // Ombre dynamique basée sur la position de la souris - plus profonde et volumineuse
        buttonRef.current.style.boxShadow = `
          ${glowX}px ${glowY}px 50px rgba(0, 102, 255, 0.4),
          0 10px 30px rgba(0, 102, 255, 0.6),
          0 20px 80px rgba(121, 40, 202, 0.3),
          inset 0 5px 20px rgba(255, 255, 255, 0.5),
          inset 0 -5px 15px rgba(0, 0, 0, 0.2)
        `;
        
        // Simuler un mouvement de fluide interne en réponse au mouvement de la souris
        const innerLayers = buttonRef.current.querySelectorAll('.inner-fluid-layer');
        if (innerLayers && innerLayers.length) {
          innerLayers.forEach((layer, index) => {
            const delay = index * 0.1;
            const intensity = 1 - (index * 0.2);
            layer.style.transform = `
              translateX(${x * 10 * intensity}px) 
              translateY(${y * 10 * intensity}px) 
              translateZ(${10 + index * 5}px)
              scale(${1 + Math.abs(x * y) * 0.05})
            `;
          });
        }
      }
    };
    
    // Animer un mouvement subtil même lorsque la souris est immobile
    const animateIdleMovement = () => {
      const time = Date.now() * 0.001; // Convertir en secondes
      
      if (buttonRef.current && !isHovered) {
        // Animation plus organique et complexe avec rotations multiples
        const idleX = Math.sin(time * 0.5) * 5;
        const idleY = Math.cos(time * 0.7) * 5;
        const idleZ = Math.sin(time * 0.3) * 3;
        
        // Simulation de battement de cœur avec scale pulsatile
        const heartbeatScale = 1 + Math.sin(time * 5) * 0.03;
        
        buttonRef.current.style.transform = `
          perspective(1000px) 
          rotateX(${idleY}deg) 
          rotateY(${idleX}deg)
          rotateZ(${idleZ}deg)
          translateZ(${5 + Math.sin(time * 2) * 5}px)
          scale3d(${heartbeatScale}, ${heartbeatScale}, ${heartbeatScale * 1.2})
        `;
        
        // Activation des couches de fluide interne
        const innerLayers = buttonRef.current.querySelectorAll('.inner-fluid-layer');
        if (innerLayers && innerLayers.length) {
          innerLayers.forEach((layer, index) => {
            const layerTime = time + index;
            const xOffset = Math.sin(layerTime * 0.7) * 5 * (1 - index * 0.2);
            const yOffset = Math.cos(layerTime * 0.5) * 5 * (1 - index * 0.2);
            const zOffset = 10 + index * 5 + Math.sin(layerTime * 0.3) * 5;
            const scaleEffect = 1 + Math.sin(layerTime) * 0.05;
            
            layer.style.transform = `
              translateX(${xOffset}px) 
              translateY(${yOffset}px) 
              translateZ(${zOffset}px)
              scale(${scaleEffect})
              rotate(${Math.sin(layerTime * 0.2) * 5}deg)
            `;
          });
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animateIdleMovement);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    animateIdleMovement();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, isClicked]);

  const handleClick = () => {
    setIsClicked(true);
    
    // Effet d'ondulation au clic
    if (buttonRef.current) {
      // Créer plusieurs ondulations avec des délais et tailles différentes
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const ripple = document.createElement('div');
          ripple.className = 'ripple-effect';
          ripple.style.animationDuration = `${0.7 + i * 0.2}s`;
          ripple.style.animationDelay = `${i * 0.1}s`;
          buttonRef.current.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, (0.7 + i * 0.2) * 1000 + (i * 0.1) * 1000);
        }, i * 50);
      }
      
      // Effet de changement de couleur supplémentaire au clic
      buttonRef.current.classList.add('color-shift');
      setTimeout(() => {
        buttonRef.current.classList.remove('color-shift');
        setIsClicked(false);
      }, 1000);
    }
    
    console.log('ChatBot iAsted activé !');
  };

  return (
    <div ref={containerRef} className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 to-black p-4 perspective-container">
      <div className="relative perspective">
        {/* Conteneur principal du bouton avec animation globale */}
        <div 
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-32 h-32 rounded-full cursor-pointer transform-gpu transition-all duration-300 ease-in-out overflow-hidden thick-matter-button living-matter"
        >
          {/* Indicateurs d'attention déplacés à l'intérieur */}
          <div className="absolute attention-indicator top-4 left-4 z-20"></div>
          <div className="absolute attention-indicator bottom-4 right-4 z-20"></div>
          
          {/* Couches de fluide interne pour créer un effet de matière vivante */}
          <div className="absolute inset-0 inner-fluid-layer layer-1"></div>
          <div className="absolute inset-0 inner-fluid-layer layer-2"></div>
          <div className="absolute inset-0 inner-fluid-layer layer-3"></div>
          
          {/* Effet de profondeur et de volume */}
          <div className="absolute inset-0 depth-layer"></div>
          
          {/* Satellite particle - petite sphère qui orbite autour de la grande sphère */}
          <div className="absolute satellite-particle"></div>
          
          {/* Émissions d'ondes */}
          <div className="wave-emission wave-1"></div>
          <div className="wave-emission wave-2"></div>
          <div className="wave-emission wave-3"></div>
          <div className="wave-emission wave-4"></div>
          
          {/* Fond morphing avec transitions fluides et animation de déformation organique */}
          <div className="morphing-bg absolute inset-0 organic-blob"></div>
          
          {/* Couche de réfraction transparente */}
          <div className="absolute inset-0 refraction-layer"></div>
          
          {/* Effet de substance épaisse pour le morphing-bg */}
          <div className="absolute inset-0 substance-effect"></div>
          
          {/* Noyau interne - CENTRÉ et RAPPROCHÉ */}
          <div className="absolute inset-0 flex items-center justify-center nucleus-container">
            <div className="inner-core"></div>
            {/* Effet de halo lumineux autour du noyau */}
            <div className="absolute core-highlight"></div>
            <div className="absolute core-halo"></div>
          </div>
          
          {/* Système orbital - CENTRÉ */}
          <div className="absolute inset-0 orbital-system">
            <div className="orbital-ring orbital-ring-1"></div>
            <div className="orbital-ring orbital-ring-2"></div>
            <div className="orbital-ring orbital-ring-3"></div>
            
            {/* Particules dans différentes orbites */}
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            
            {/* Effet de gel autour des particules */}
            <div className="particle-glow particle-glow-1"></div>
            <div className="particle-glow particle-glow-2"></div>
            <div className="particle-glow particle-glow-3"></div>
          </div>
          
          {/* Lueur ambiante */}
          <div className="absolute inset-0 rounded-full ambient-glow"></div>
          
          {/* Surface neuromorphique du bouton avec effet de volume */}
          <div className="absolute inset-2 rounded-full neuromorphic-surface"></div>
          {/* Membrane de la surface */}
          <div className="absolute inset-2 neuromorphic-membrane"></div>
          
          {/* Couche de brillance et reflets */}
          <div className="absolute inset-0 highlight-layer"></div>
          
          {/* Messages subliminaux (vides) */}
          <div className="absolute inset-0 subliminal-messages">
            <div className="subliminal subliminal-1"></div>
            <div className="subliminal subliminal-2"></div>
            <div className="subliminal subliminal-3"></div>
          </div>
          
          {/* Pulsation cardiaque */}
          <div className="absolute inset-0 rounded-full heartbeat-pulse"></div>
          
          {/* Courants tourbillonnants pour effet de fluide en mouvement */}
          <div className="absolute inset-0 vortex-container">
            <div className="vortex vortex-1"></div>
            <div className="vortex vortex-2"></div>
          </div>
          
          {/* Texte et icônes alternant avec lueur dynamique - avec contre-rotation */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-center z-10 pointer-events-none text-glow icon-container-wrapper">
            <div className="icon-container">
              <div className="alternating-element text-element">
                <p className="text-2xl tracking-wide whitespace-nowrap">Mr Ray</p>
              </div>
              <div className="alternating-element mic-element">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
                  <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="alternating-element chat-element">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
                  <path d="M7 9H17V11H7V9Z" fill="currentColor"/>
                  <path d="M7 12H14V14H7V12Z" fill="currentColor"/>
                  <path d="M7 6H17V8H7V6Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        /* Styling de base avec perspective améliorée */
        .perspective-container {
          perspective: 1500px;
        }
        
        .perspective {
          perspective: 1200px;
          position: relative;
          transform-style: preserve-3d;
        }
        
        /* Style pour le bouton avec matière épaisse */
        .thick-matter-button {
          transform-style: preserve-3d;
          border-radius: 50%;
          will-change: transform, box-shadow;
          transition: transform 0.3s ease-out;
          
          /* Ombre initiale pour effet 3D épais */
          box-shadow: 
            0 10px 20px rgba(0, 0, 0, 0.5),
            0 6px 6px rgba(0, 0, 0, 0.3),
            inset 0 -5px 15px rgba(0, 0, 0, 0.3),
            inset 0 5px 15px rgba(255, 255, 255, 0.3);
        }
        
        /* Couche de profondeur pour effet 3D épais */
        .depth-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(0, 0, 0, 0.4) 80%
          );
          filter: blur(2px);
          opacity: 0.6;
          transform: translateZ(-10px);
        }
        
        /* Couche de réfraction pour effet de matière épaisse */
        .refraction-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at calc(50% + ${mousePosition.x * 30}px) calc(50% + ${mousePosition.y * 30}px),
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.05) 40%,
            transparent 70%
          );
          opacity: 0.5;
          mix-blend-mode: overlay;
          filter: blur(1px);
          animation: refraction-shift 8s ease infinite;
          transform: translateZ(8px);
        }
        
        /* Couche de brillance et reflets pour effet 3D */
        .highlight-layer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 45%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 55%,
            transparent 70%
          );
          transform: translateZ(15px) rotate(45deg);
          opacity: 0.6;
          filter: blur(3px);
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        
        /* Animation de la couche de réfraction */
        @keyframes refraction-shift {
          0%, 100% { transform: translateZ(8px) scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: translateZ(8px) scale(1.05) rotate(10deg); opacity: 0.7; }
        }
        
        /* Petite sphère satellite - basée sur l'image 2 */
        .satellite-particle {
          width: 10px; 
          height: 10px;
          top: 5px;
          left: 0;
          border-radius: 50%;
          background: rgba(0, 170, 255, 0.9);
          box-shadow: 
            0 0 8px rgba(0, 170, 255, 0.8), 
            0 0 12px rgba(0, 170, 255, 0.4),
            inset 0 -2px 3px rgba(0, 0, 0, 0.3),
            inset 0 2px 3px rgba(255, 255, 255, 0.5);
          z-index: 20;
          position: absolute;
          animation: orbit-close 4s linear infinite;
          transform-style: preserve-3d;
          transform: translateZ(30px);
        }
        
        @keyframes orbit-close {
          0% { transform: translateZ(30px) rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: translateZ(30px) rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        
        /* Émissions d'ondes synchronisées avec effet de volume */
        @keyframes wave-emission-3d {
          0% { transform: scale3d(0.9, 0.9, 1) translateZ(0px); opacity: 0.5; }
          50% { transform: scale3d(1.5, 1.5, 1.2) translateZ(5px); opacity: 0; }
          100% { transform: scale3d(1.8, 1.8, 1.4) translateZ(10px); opacity: 0; }
        }
        
        /* CORRECTION: Positionnement fixe des émissions d'ondes */
        .wave-emission {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          transform: scale3d(0.9, 0.9, 1);
          opacity: 0;
          transform-style: preserve-3d;
        }
        
        .wave-1 {
          animation: wave-emission-3d 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        
        .wave-2 {
          animation: wave-emission-3d 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          animation-delay: 0.55s;
        }
        
        .wave-3 {
          animation: wave-emission-3d 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          animation-delay: 1.1s;
        }
        
        .wave-4 {
          animation: wave-emission-3d 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          animation-delay: 1.65s;
        }
        
        /* Effet de mélange de fluides colorés avec aspects 3D et viscosité - effet de vie plus intense */
        @keyframes fluid-mix-3d-alive {
          0% { 
            background-position: 0% 0%;
            filter: hue-rotate(0deg) brightness(1);
            border-radius: 70% 30% 40% 60% / 60% 40% 70% 30%;
            transform: translateZ(0px) rotate(0deg);
          }
          20% { 
            background-position: 100% 30%;
            filter: hue-rotate(60deg) brightness(1.2);
            border-radius: 30% 70% 60% 40% / 40% 50% 50% 60%;
            transform: translateZ(7px) rotate(72deg);
          }
          40% { 
            background-position: 60% 100%; 
            filter: hue-rotate(120deg) brightness(1.4);
            border-radius: 50% 50% 30% 70% / 40% 60% 30% 70%;
            transform: translateZ(10px) rotate(144deg);
          }
          60% { 
            background-position: 20% 50%;
            filter: hue-rotate(180deg) brightness(1.3);
            border-radius: 65% 35% 20% 80% / 40% 60% 35% 65%;
            transform: translateZ(5px) rotate(216deg);
          }
          80% { 
            background-position: 70% 30%;
            filter: hue-rotate(240deg) brightness(1.1);
            border-radius: 35% 65% 75% 25% / 70% 20% 80% 30%;
            transform: translateZ(8px) rotate(288deg);
          }
          100% { 
            background-position: 0% 0%;
            filter: hue-rotate(360deg) brightness(1);
            border-radius: 70% 30% 40% 60% / 60% 40% 70% 30%;
            transform: translateZ(0px) rotate(360deg);
          }
        }
        
        .morphing-bg {
          background: linear-gradient(
            135deg, 
            #0066FF 0%, 
            #00AAFF 15%, 
            #00FFFF 30%, 
            #4400FF 45%, 
            #FF00FF 60%,
            #FFCC00 75%,
            #FFC125 90%,
            #0066FF 100%
          );
          background-size: 400% 400%;
          animation: fluid-mix-3d-alive 15s ease-in-out infinite;
          filter: saturate(1.7) brightness(1.1);
          mix-blend-mode: lighten;
          box-shadow: 
            inset 0 0 30px rgba(255, 255, 255, 0.2),
            inset 0 0 60px rgba(0, 170, 255, 0.2),
            inset 0 0 90px rgba(255, 204, 0, 0.1);
          transform-style: preserve-3d;
        }
        
        /* Effet de substance épaisse */
        .substance-effect {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.3);
          opacity: 0.4;
          background: radial-gradient(
            circle at 50% 120%, 
            rgba(255, 255, 255, 0.3) 0%,
            rgba(0, 0, 0, 0.2) 80%
          );
          transform-style: preserve-3d;
          animation: inner-fluid-movement 8s ease-in-out infinite alternate;
        }
        
        @keyframes inner-fluid-movement {
          0% {
            border-radius: 40% 60% 70% 30% / 40% 40% 60% 60%; 
            opacity: 0.3;
            transform: translateZ(5px) rotate(0deg);
          }
          50% {
            border-radius: 60% 40% 30% 70% / 70% 50% 50% 30%;
            opacity: 0.5;
            transform: translateZ(15px) rotate(180deg);
          }
          100% {
            border-radius: 50% 50% 40% 60% / 30% 60% 40% 70%;
            opacity: 0.3;
            transform: translateZ(5px) rotate(360deg);
          }
        }
        
        /* Noyau interne avec effet de fluide coloré en 3D - battements plus intenses */
        @keyframes fluid-core-colors-3d-intense {
          0% {
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 215, 0, 0.5) 30%,
              rgba(0, 102, 255, 0.4) 60%,
              rgba(100, 0, 255, 0.1) 100%
            );
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.7), 
              0 0 40px rgba(0, 102, 255, 0.5),
              inset 0 2px 5px rgba(255, 255, 255, 0.5),
              inset 0 -2px 5px rgba(0, 0, 0, 0.3);
            transform: translateZ(25px) scale3d(1, 1, 1) rotate(0deg);
          }
          25% {
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(0, 102, 255, 0.5) 30%,
              rgba(255, 215, 0, 0.4) 60%,
              rgba(255, 0, 127, 0.1) 100%
            );
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.8), 
              0 0 60px rgba(255, 215, 0, 0.6),
              inset 0 3px 6px rgba(255, 255, 255, 0.6),
              inset 0 -3px 6px rgba(0, 0, 0, 0.4);
            transform: translateZ(35px) scale3d(1.3, 1.3, 1.5) rotate(90deg);
          }
          50% {
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(0, 170, 255, 0.5) 30%,
              rgba(255, 193, 37, 0.4) 60%,
              rgba(0, 255, 127, 0.1) 100%
            );
            box-shadow: 
              0 0 25px rgba(255, 255, 255, 0.7), 
              0 0 50px rgba(0, 170, 255, 0.5),
              inset 0 2px 5px rgba(255, 255, 255, 0.5),
              inset 0 -2px 5px rgba(0, 0, 0, 0.3);
            transform: translateZ(30px) scale3d(1.1, 1.1, 1.2) rotate(180deg);
          }
          75% {
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 128, 0, 0.5) 30%,
              rgba(0, 128, 255, 0.4) 60%,
              rgba(128, 0, 255, 0.1) 100%
            );
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.8), 
              0 0 60px rgba(0, 128, 255, 0.6),
              inset 0 3px 6px rgba(255, 255, 255, 0.6),
              inset 0 -3px 6px rgba(0, 0, 0, 0.4);
            transform: translateZ(35px) scale3d(1.3, 1.3, 1.5) rotate(270deg);
          }
          100% {
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 215, 0, 0.5) 30%,
              rgba(0, 102, 255, 0.4) 60%,
              rgba(100, 0, 255, 0.1) 100%
            );
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.7), 
              0 0 40px rgba(0, 102, 255, 0.5),
              inset 0 2px 5px rgba(255, 255, 255, 0.5),
              inset 0 -2px 5px rgba(0, 0, 0, 0.3);
            transform: translateZ(25px) scale3d(1, 1, 1) rotate(360deg);
          }
        }
        
        /* Animation du noyau interne avec déformation organique en 3D - plus intense */
        @keyframes core-pulse-3d-heartbeat {
          0%, 100% { 
            transform: translateZ(25px) scale3d(0.9, 0.9, 0.9) rotate(0deg); 
            filter: brightness(0.8);
            border-radius: 50%;
          }
          10% { 
            transform: translateZ(30px) scale3d(1.1, 1.1, 1.3) rotate(10deg); 
            filter: brightness(1.2);
            border-radius: 45% 55% 52% 48% / 48% 52% 48% 52%;
          }
          15% { 
            transform: translateZ(25px) scale3d(0.95, 0.95, 0.9) rotate(15deg); 
            filter: brightness(0.9);
            border-radius: 50%;
          }
          25% { 
            transform: translateZ(38px) scale3d(1.4, 1.4, 1.6) rotate(25deg); 
            filter: brightness(1.5);
            border-radius: 52% 48% 45% 55% / 55% 45% 55% 45%;
          }
          35% { 
            transform: translateZ(25px) scale3d(0.9, 0.9, 0.8) rotate(35deg); 
            filter: brightness(0.8);
            border-radius: 50%;
          }
          65% { 
            transform: translateZ(28px) scale3d(1.0, 1.0, 1.0) rotate(65deg); 
            filter: brightness(1.0);
            border-radius: 49% 51% 51% 49% / 49% 51% 49% 51%;
          }
          80% { 
            transform: translateZ(35px) scale3d(1.3, 1.3, 1.5) rotate(80deg); 
            filter: brightness(1.4);
            border-radius: 54% 46% 48% 52% / 46% 54% 46% 54%;
          }
          85% { 
            transform: translateZ(25px) scale3d(0.9, 0.9, 0.9) rotate(85deg); 
            filter: brightness(0.8);
            border-radius: 50%;
          }
        }
        
        .inner-core {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          animation: 
            core-pulse-3d-heartbeat 1s cubic-bezier(0.215, 0.61, 0.355, 1) infinite,
            fluid-core-colors-3d-intense 8s linear infinite;
          filter: contrast(1.2);
          background-blend-mode: overlay;
          transform-style: preserve-3d;
          transform: translateZ(25px);
        }
        
        /* Effet de sphère 3D avec ombres et reflets */
        .core-highlight {
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.8) 0%,
            transparent 50%
          );
          opacity: 0.5;
          animation: core-highlight-pulse 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        
        /* Ajouter un halo lumineux pulsant */
        .core-halo {
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(0, 170, 255, 0.2) 30%,
            rgba(255, 204, 0, 0.1) 60%,
            transparent 100%
          );
          filter: blur(5px);
          animation: halo-pulse 1s ease-in-out infinite alternate;
        }
        
        @keyframes core-highlight-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes halo-pulse {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 0.6; transform: scale(1.2); }
        }
        
        /* Système orbital avec ratio d'or et effet 3D */
        .orbital-system {
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: orbit-system-tilt 15s ease-in-out infinite alternate;
        }
        
        @keyframes orbit-system-tilt {
          0%, 100% { transform: rotateX(5deg) rotateY(-5deg); }
          50% { transform: rotateX(-5deg) rotateY(5deg); }
        }
        
        @keyframes orbital-rotation-1-3d {
          0% { transform: translateZ(10px) rotateZ(0deg) rotateX(60deg) rotateY(0deg); }
          100% { transform: translateZ(10px) rotateZ(360deg) rotateX(60deg) rotateY(0deg); }
        }
        
        @keyframes orbital-rotation-2-3d {
          0% { transform: translateZ(5px) rotateZ(0deg) rotateX(0deg) rotateY(60deg); }
          100% { transform: translateZ(5px) rotateZ(360deg) rotateX(0deg) rotateY(60deg); }
        }
        
        @keyframes orbital-rotation-3-3d {
          0% { transform: translateZ(15px) rotateZ(90deg) rotateX(30deg) rotateY(30deg); }
          100% { transform: translateZ(15px) rotateZ(450deg) rotateX(30deg) rotateY(30deg); }
        }
        
        .orbital-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid transparent;
          transform-style: preserve-3d;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }
        
        .orbital-ring-1 {
          border-top: 1.5px solid rgba(0, 102, 255, 0.9);
          border-bottom: 1.5px solid rgba(0, 102, 255, 0.3);
          animation: orbital-rotation-1-3d 8s linear infinite;
        }
        
        .orbital-ring-2 {
          border-left: 1.5px solid rgba(255, 204, 0, 0.9);
          border-right: 1.5px solid rgba(255, 204, 0, 0.3);
          animation: orbital-rotation-2-3d 12s linear infinite;
        }
        
        .orbital-ring-3 {
          border-top: 1.5px solid rgba(0, 170, 255, 0.9);
          border-bottom: 1.5px solid rgba(0, 170, 255, 0.3);
          animation: orbital-rotation-3-3d 10s linear infinite;
        }
        
        /* Particules avec timing selon la séquence de Fibonacci et changement de couleur en 3D */
        @keyframes particle-orbit-3d-dynamic {
          0% { 
            transform: rotateZ(var(--start-deg)) translateX(var(--orbit-radius)) translateZ(var(--z-offset)) scale3d(0.8, 0.8, 1); 
            opacity: 0.4;
            filter: hue-rotate(0deg) brightness(1);
            box-shadow: 0 0 var(--glow-size) var(--color), 0 0 calc(var(--glow-size) * 2) var(--color-transparent);
          }
          25% { 
            transform: rotateZ(calc(var(--start-deg) + 90deg)) translateX(calc(var(--orbit-radius) + 5px)) translateZ(calc(var(--z-offset) + 8px)) scale3d(1.3, 1.3, 1.5); 
            opacity: 1;
            filter: hue-rotate(90deg) brightness(1.3);
            box-shadow: 0 0 calc(var(--glow-size) * 2) var(--color), 0 0 calc(var(--glow-size) * 4) var(--color-transparent);
          }
          50% { 
            transform: rotateZ(calc(var(--start-deg) + 180deg)) translateX(var(--orbit-radius)) translateZ(var(--z-offset)) scale3d(0.6, 0.6, 0.8); 
            opacity: 0.3;
            filter: hue-rotate(180deg) brightness(0.9);
            box-shadow: 0 0 var(--glow-size) var(--color), 0 0 calc(var(--glow-size) * 1.5) var(--color-transparent);
          }
          75% { 
            transform: rotateZ(calc(var(--start-deg) + 270deg)) translateX(calc(var(--orbit-radius) + 8px)) translateZ(calc(var(--z-offset) - 5px)) scale3d(1.4, 1.4, 1.7); 
            opacity: 1;
            filter: hue-rotate(270deg) brightness(1.5);
            box-shadow: 0 0 calc(var(--glow-size) * 2.5) var(--color), 0 0 calc(var(--glow-size) * 5) var(--color-transparent);
          }
          100% { 
            transform: rotateZ(calc(var(--start-deg) + 360deg)) translateX(var(--orbit-radius)) translateZ(var(--z-offset)) scale3d(0.8, 0.8, 1); 
            opacity: 0.4;
            filter: hue-rotate(360deg) brightness(1);
            box-shadow: 0 0 var(--glow-size) var(--color), 0 0 calc(var(--glow-size) * 2) var(--color-transparent);
          }
        }
        
        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          filter: blur(0.5px);
          transform-origin: center;
          transform-style: preserve-3d;
          animation-name: particle-orbit-3d-dynamic;
          animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        
        /* Effet de gel pour les particules */
        .particle-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: inherit;
          filter: blur(2px);
          opacity: 0.5;
          transform: translateZ(-1px);
        }
        
        .particle-1 {
          --start-deg: 0deg;
          --orbit-radius: 45px;
          --z-offset: 20px;
          --color: #0066FF;
          --color-transparent: rgba(0, 102, 255, 0.5);
          --glow-size: 10px;
          background: #0066FF;
          box-shadow: 0 0 10px #0066FF, 0 0 20px rgba(0, 102, 255, 0.5);
          animation: particle-orbit-3d-dynamic 5s linear infinite;
        }
        
        .particle-2 {
          --start-deg: 60deg;
          --orbit-radius: 42px;
          --z-offset: 15px;
          --color: #FFCC00;
          --color-transparent: rgba(255, 204, 0, 0.5);
          --glow-size: 10px;
          background: #FFCC00;
          box-shadow: 0 0 10px #FFCC00, 0 0 20px rgba(255, 204, 0, 0.5);
          animation: particle-orbit-3d-dynamic 8s linear infinite;
        }
        
        .particle-3 {
          --start-deg: 120deg;
          --orbit-radius: 48px;
          --z-offset: 10px;
          --color: #00AAFF;
          --color-transparent: rgba(0, 170, 255, 0.5);
          --glow-size: 10px;
          background: #00AAFF;
          box-shadow: 0 0 10px #00AAFF, 0 0 20px rgba(0, 170, 255, 0.5);
          animation: particle-orbit-3d-dynamic 13s linear infinite;
        }
        
        .particle-4 {
          --start-deg: 180deg;
          --orbit-radius: 38px;
          --z-offset: 25px;
          --color: #FFD700;
          --color-transparent: rgba(255, 215, 0, 0.5);
          --glow-size: 10px;
          background: #FFD700;
          box-shadow: 0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5);
          animation: particle-orbit-3d-dynamic 21s linear infinite;
        }
        
        .particle-5 {
          --start-deg: 240deg;
          --orbit-radius: 52px;
          --z-offset: 12px;
          --color: #1E90FF;
          --color-transparent: rgba(30, 144, 255, 0.5);
          --glow-size: 10px;
          background: #1E90FF;
          box-shadow: 0 0 10px #1E90FF, 0 0 20px rgba(30, 144, 255, 0.5);
          animation: particle-orbit-3d-dynamic 34s linear infinite;
        }
        
        .particle-6 {
          --start-deg: 300deg;
          --orbit-radius: 46px;
          --z-offset: 18px;
          --color: #FFC125;
          --color-transparent: rgba(255, 193, 37, 0.5);
          --glow-size: 10px;
          background: #FFC125;
          box-shadow: 0 0 10px #FFC125, 0 0 20px rgba(255, 193, 37, 0.5);
          animation: particle-orbit-3d-dynamic 18s linear infinite;
        }
        
        /* Surface neuromorphique avec effet de volume */
        .neuromorphic-surface {
          background: radial-gradient(
            circle at calc(50% + ${mousePosition.x * 20}px) calc(50% + ${mousePosition.y * 20}px),
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(0, 0, 0, 0.2) 100%
          );
          backdrop-filter: blur(4px);
          opacity: 0.85;
          border-radius: 50%;
          transform: translateZ(12px);
          box-shadow: 
            inset 0 1px 8px rgba(255, 255, 255, 0.3),
            inset 0 -2px 5px rgba(0, 0, 0, 0.2);
        }
        
        /* Membrane de la surface avec mouvement */
        .neuromorphic-membrane {
          border-radius: 50%;
          background: radial-gradient(
            circle at calc(50% + ${mousePosition.x * 40}px) calc(50% + ${mousePosition.y * 40}px),
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          filter: blur(5px);
          opacity: 0.5;
          transform: translateZ(5px);
          pointer-events: none;
          transition: all 0.2s ease-out;
        }
        
        /* Animation de la pulsation cardiaque avec déformations organiques plus intenses */
        @keyframes heartbeat-intense {
          0% { 
            transform: scale3d(1, 1, 1); 
            opacity: 0.2;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.2);
          }
          10% { 
            transform: scale3d(1.08, 1.08, 1.2); 
            opacity: 0.4;
            border-radius: 48% 52% 55% 45% / 52% 48% 52% 48%;
            box-shadow: 0 0 20px rgba(0, 102, 255, 0.3);
          }
          20% { 
            transform: scale3d(0.95, 0.95, 0.9); 
            opacity: 0.2;
            border-radius: 51% 49% 47% 53% / 47% 53% 47% 53%;
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.2);
          }
          30% { 
            transform: scale3d(1.1, 1.1, 1.3); 
            opacity: 0.5;
            border-radius: 45% 55% 60% 40% / 55% 45% 60% 40%;
            box-shadow: 0 0 30px rgba(0, 102, 255, 0.4);
          }
          45% { 
            transform: scale3d(0.9, 0.9, 0.8); 
            opacity: 0.2;
            border-radius: 50% 50% 48% 52% / 52% 48% 50% 50%;
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.2);
          }
          60% { 
            transform: scale3d(1, 1, 1); 
            opacity: 0.3;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(0, 102, 255, 0.25);
          }
          100% { 
            transform: scale3d(1, 1, 1); 
            opacity: 0.2;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.2);
          }
        }
        
        .heartbeat-pulse {
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: heartbeat-intense 1s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          transform-style: preserve-3d;
        }
        
        /* Classe générale pour la matière vivante */
        .living-matter {
          animation: living-matter-float 10s ease-in-out infinite alternate,
                     living-matter-rotate 30s linear infinite;
        }
        
        @keyframes living-matter-float {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-10px) translateX(5px); }
        }
        
        @keyframes living-matter-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Couches de fluide interne */
        .inner-fluid-layer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          opacity: 0.4;
          transform-style: preserve-3d;
          pointer-events: none;
        }
        
        .layer-1 {
          background: radial-gradient(
            circle at 30% 40%,
            rgba(0, 102, 255, 0.2) 0%,
            rgba(255, 204, 0, 0.1) 50%,
            transparent 80%
          );
          animation: fluid-layer-1 8s ease-in-out infinite alternate;
          filter: blur(2px);
          transform: translateZ(10px);
        }
        
        .layer-2 {
          background: radial-gradient(
            circle at 70% 30%,
            rgba(255, 204, 0, 0.2) 0%,
            rgba(0, 170, 255, 0.1) 50%,
            transparent 80%
          );
          animation: fluid-layer-2 12s ease-in-out infinite alternate-reverse;
          filter: blur(3px);
          transform: translateZ(15px);
        }
        
        .layer-3 {
          background: radial-gradient(
            circle at 50% 60%,
            rgba(0, 170, 255, 0.2) 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 80%
          );
          animation: fluid-layer-3 10s ease-in-out infinite alternate;
          filter: blur(4px);
          transform: translateZ(20px);
        }
        
        @keyframes fluid-layer-1 {
          0% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            transform: translateZ(10px) rotate(0deg);
          }
          100% {
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
            transform: translateZ(15px) rotate(60deg);
          }
        }
        
        @keyframes fluid-layer-2 {
          0% {
            border-radius: 70% 30% 50% 50% / 30% 50% 50% 70%;
            transform: translateZ(15px) rotate(0deg);
          }
          100% {
            border-radius: 50% 50% 70% 30% / 50% 70% 30% 50%;
            transform: translateZ(20px) rotate(-90deg);
          }
        }
        
        @keyframes fluid-layer-3 {
          0% {
            border-radius: 50% 50% 30% 70% / 60% 40% 60% 40%;
            transform: translateZ(20px) rotate(0deg);
          }
          100% {
            border-radius: 40% 60% 60% 40% / 30% 60% 40% 70%;
            transform: translateZ(25px) rotate(120deg);
          }
        }
        
        /* Effet de tourbillons pour simuler des courants internes */
        .vortex-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transform-style: preserve-3d;
          opacity: 0.4;
        }
        
        .vortex {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          transform-style: preserve-3d;
          opacity: 0.25;
          filter: blur(3px);
        }
        
        .vortex-1 {
          background: conic-gradient(
            from 0deg,
            rgba(0, 102, 255, 0) 0%,
            rgba(0, 102, 255, 0.2) 25%,
            rgba(255, 204, 0, 0.3) 50%,
            rgba(0, 170, 255, 0.2) 75%,
            rgba(0, 102, 255, 0) 100%
          );
          animation: vortex-spin-1 15s linear infinite;
          transform: translateZ(8px);
        }
        
        .vortex-2 {
          background: conic-gradient(
            from 180deg,
            rgba(255, 204, 0, 0) 0%,
            rgba(255, 204, 0, 0.2) 25%,
            rgba(0, 102, 255, 0.3) 50%,
            rgba(255, 215, 0, 0.2) 75%,
            rgba(255, 204, 0, 0) 100%
          );
          animation: vortex-spin-2 10s linear infinite;
          transform: translateZ(12px);
        }
        
        @keyframes vortex-spin-1 {
          0% { transform: translateZ(8px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateZ(10px) rotate(180deg); opacity: 0.4; }
          100% { transform: translateZ(8px) rotate(360deg); opacity: 0.2; }
        }
        
        @keyframes vortex-spin-2 {
          0% { transform: translateZ(12px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateZ(14px) rotate(-180deg); opacity: 0.35; }
          100% { transform: translateZ(12px) rotate(-360deg); opacity: 0.2; }
        }
        
        /* Conteneur du noyau avec animation */
        .nucleus-container {
          animation: nucleus-orbit 12s ease-in-out infinite alternate;
          transform-style: preserve-3d;
        }
        
        @keyframes nucleus-orbit {
          0% { transform: translateX(-2px) translateY(-2px) rotate(0deg); }
          33% { transform: translateX(3px) translateY(1px) rotate(120deg); }
          66% { transform: translateX(-1px) translateY(3px) rotate(240deg); }
          100% { transform: translateX(2px) translateY(-3px) rotate(360deg); }
        }
        
        /* Effet d'ondulation au clic avec variations de couleurs */
        @keyframes ripple {
          0% { 
            transform: scale(0.1); 
            opacity: 1; 
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(0, 102, 255, 0.5) 50%, rgba(255, 204, 0, 0.2) 70%);
          }
          50% { 
            transform: scale(1.5); 
            opacity: 0.8;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(0, 170, 255, 0.4) 40%, rgba(255, 215, 0, 0.3) 70%);
          }
          100% { 
            transform: scale(2.5); 
            opacity: 0;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(30, 144, 255, 0.2) 40%, rgba(255, 193, 37, 0.1) 70%);
          }
        }
        
        .ripple-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.1);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.1) 70%);
          animation: ripple 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          mix-blend-mode: screen;
        }
        
        /* Effet de changement de couleur au clic */
        @keyframes color-shift-animation {
          0% { filter: hue-rotate(0deg) saturate(1.5); }
          50% { filter: hue-rotate(180deg) saturate(2.5); }
          100% { filter: hue-rotate(0deg) saturate(1.5); }
        }
        
        .color-shift {
          animation: color-shift-animation 1s ease-in-out;
        }
        
        /* Indicateurs d'attention subtils */
        @keyframes attention-pulse {
          0%, 100% { transform: scale(0.9) translate(-16px, -16px); opacity: 0.2; }
          50% { transform: scale(1.1) translate(-16px, -16px); opacity: 0.5; }
        }
        
        .attention-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0066FF;
          box-shadow: 0 0 10px rgba(0, 102, 255, 0.7);
          animation: attention-pulse 3s ease-in-out infinite;
        }
        
        .attention-indicator:nth-child(2) {
          animation-delay: 1.5s;
          background: #FFCC00;
          box-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
        }
        
        /* Effet de lueur du texte */
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.7), 0 0 10px rgba(255, 255, 255, 0.5); }
          50% { text-shadow: 0 0 8px rgba(255, 255, 255, 0.9), 0 0 15px rgba(255, 255, 255, 0.7), 0 0 20px rgba(0, 102, 255, 0.5); }
        }
        
        .text-glow {
          animation: text-glow 3s ease-in-out infinite;
          letter-spacing: 1px;
        }
        
        /* Animation des éléments alternants avec contre-rotation et mouvements indépendants */
        .icon-container-wrapper {
          /* Appliquer une contre-rotation pour neutraliser la rotation du bouton principal */
          animation: counter-rotate 30s linear infinite;
          transform-style: preserve-3d;
          z-index: 30;
        }
        
        @keyframes counter-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        
        .icon-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          /* Animations indépendantes pour le conteneur d'icônes */
          animation: icon-container-float 7s ease-in-out infinite alternate;
        }
        
        @keyframes icon-container-float {
          0% { transform: translateY(-2px) scale(0.98); }
          50% { transform: translateY(3px) scale(1.02) rotate(5deg); }
          100% { transform: translateY(1px) scale(1) rotate(-5deg); }
        }
        
        .alternating-element {
          position: absolute;
          opacity: 0;
          transform: translateY(8px) scale(0.9);
          /* Ajout d'un effet de flottement indépendant */
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }
        
        /* Animation de fade-in-out pour les éléments alternants */
        @keyframes fade-in-out {
          0%, 33%, 100% { opacity: 0; }
          5%, 28% { opacity: 1; }
        }
        
        @keyframes text-float-animation {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-3px) scale(1.05) rotate(1deg); }
          50% { transform: translateY(2px) scale(0.98) rotate(-1deg); }
          75% { transform: translateY(-1px) scale(1.02) rotate(2deg); }
        }
        
        @keyframes mic-float-animation {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          30% { transform: translateY(2px) scale(1.03) rotate(5deg); }
          70% { transform: translateY(-3px) scale(0.97) rotate(-3deg); }
        }
        
        @keyframes chat-float-animation {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          40% { transform: translateY(-2px) scale(1.05) rotate(-4deg); }
          80% { transform: translateY(3px) scale(0.98) rotate(2deg); }
        }
        
        .text-element {
          animation: 
            fade-in-out 9s cubic-bezier(0.25, 0.1, 0.25, 1) infinite,
            text-float-animation 4s ease-in-out infinite;
        }
        
        .mic-element {
          animation: 
            fade-in-out 9s cubic-bezier(0.25, 0.1, 0.25, 1) infinite,
            mic-float-animation 5s ease-in-out infinite;
          animation-delay: 3s, 0s;
        }
        
        .chat-element {
          animation: 
            fade-in-out 9s cubic-bezier(0.25, 0.1, 0.25, 1) infinite,
            chat-float-animation 6s ease-in-out infinite;
          animation-delay: 6s, 0s;
        }
      `}</style>
    </div>
  );
};

export default IAstedButton;
