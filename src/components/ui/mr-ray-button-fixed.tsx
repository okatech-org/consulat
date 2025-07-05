'use client';

import React, { useState, useRef, useCallback } from 'react';
import './mr-ray-button-fixed.css';
interface IAstedButtonProps {
  className?: string;
}

const IAstedButton: React.FC<IAstedButtonProps> = () => {
  // Optimize state management with single state object
  const [state, setState] = useState({ isHovered: false, mousePosition: { x: 0, y: 0 } });

  // Use refs for DOM elements and animation frame
  const buttonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize handlers with useCallback
  const handleMouseEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isHovered: false }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex cursor-none items-center w-full h-full justify-center perspective-container"
    >
      <div className="relative perspective">
        {/* Conteneur principal du bouton avec animation globale */}
        <div
          ref={buttonRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative size-14 rounded-full cursor-pointer transform-gpu transition-all duration-300 ease-in-out overflow-hidden thick-matter-button living-matter"
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
                <p className="text-xs tracking-wide whitespace-nowrap">Mr Ray</p>
              </div>
              <div className="alternating-element mic-element">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="alternating-element chat-element">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                    fill="currentColor"
                  />
                  <path d="M7 9H17V11H7V9Z" fill="currentColor" />
                  <path d="M7 12H14V14H7V12Z" fill="currentColor" />
                  <path d="M7 6H17V8H7V6Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Couche de réfraction pour effet de matière épaisse */
        .refraction-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at calc(50% + ${state.mousePosition.x * 30}px)
              calc(50% + ${state.mousePosition.y * 30}px),
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
        /* Surface neuromorphique avec effet de volume */
        .neuromorphic-surface {
          background: radial-gradient(
            circle at calc(50% + ${state.mousePosition.x * 20}px)
              calc(50% + ${state.mousePosition.y * 20}px),
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
            circle at calc(50% + ${state.mousePosition.x * 40}px)
              calc(50% + ${state.mousePosition.y * 40}px),
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          filter: blur(5px);
          opacity: 0.5;
          transform: translateZ(5px);
          pointer-events: none;
          transition: all 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IAstedButton;
