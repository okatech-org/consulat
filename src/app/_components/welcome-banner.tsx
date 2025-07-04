'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function WelcomeBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la première visite après connexion
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowBanner(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-50 mx-auto max-w-2xl">
      <div className="relative rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white shadow-lg">
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 rounded-full p-1 transition hover:bg-white/20"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-8">
          <h3 className="mb-1 text-lg font-bold">🎉 Bienvenue sur Consulat !</h3>
          <p className="text-sm opacity-90">
            Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes
            les fonctionnalités de l'application.
          </p>
        </div>
      </div>
    </div>
  );
}
