'use client';

import { useEffect } from 'react';
import { setCookie } from 'cookies-next';

export const ViewportDetector = () => {
  useEffect(() => {
    // Function to check if viewport is mobile sized (under 768px width)
    const checkIfMobile = () => {
      const isMobile = window.innerWidth < 768;
      setCookie('x-is-mobile', isMobile ? 'true' : 'false', {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'strict',
      });
    };

    // Check immediately on mount
    checkIfMobile();

    // Set up resize listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // This component doesn't render anything
  return null;
};
