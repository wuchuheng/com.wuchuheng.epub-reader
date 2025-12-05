import { useState, useEffect } from 'react';

// Type definition for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstalled: boolean;
  installPWA: () => Promise<void>;
  canInstall: boolean;
}

export const usePWAInstall = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('PWA Install Hook: Initializing...');

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Install Hook: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      console.log('PWA Install Hook: App installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Check PWA compatibility
    const checkPWACompatibility = () => {
      console.log('PWA Install Hook: Checking compatibility...');

      // Check if already installed
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).navigator.standalone === true
      ) {
        console.log('PWA Install Hook: Already in standalone mode');
        setIsInstalled(true);
        setIsLoading(false);
        return;
      }

      // Check service worker support
      if ('serviceWorker' in navigator) {
        console.log('PWA Install Hook: Service Worker supported');

        // Check if service worker is registered
        navigator.serviceWorker.getRegistration().then((registration) => {
          console.log('PWA Install Hook: Service Worker registration:', registration);
          if (registration) {
            console.log('PWA Install Hook: Service Worker is registered');
          } else {
            console.log('PWA Install Hook: Service Worker NOT registered');
          }
        });
      } else {
        console.log('PWA Install Hook: Service Worker NOT supported');
      }

      // Check manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      console.log('PWA Install Hook: Manifest link:', manifestLink);
      if (manifestLink) {
        console.log('PWA Install Hook: Manifest href:', manifestLink.getAttribute('href'));
      }

      // Check HTTPS (required for PWA install in production)
      console.log('PWA Install Hook: Protocol:', window.location.protocol);
      console.log('PWA Install Hook: Hostname:', window.location.hostname);
      console.log(
        'PWA Install Hook: Is localhost:',
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      );

      // Check if we're in a secure context
      console.log('PWA Install Hook: Is secure context:', window.isSecureContext);

      setIsLoading(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial compatibility check
    checkPWACompatibility();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const finalState = { isInstalled, installPWA, canInstall: !!deferredPrompt && !isLoading };
  console.log('PWA Install Hook: Returning state:', finalState);
  return finalState;
};
