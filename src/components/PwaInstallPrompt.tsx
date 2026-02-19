import React, { useEffect, useState } from 'react';
import { HiOutlineArrowDownTray, HiOutlineXMark } from 'react-icons/hi2';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'mt_pwa_prompt_dismissed';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === '1';
      if (alreadyDismissed) return;

      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_KEY, '1');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-[120] max-w-xs w-[calc(100%-2rem)] bg-white border border-gray-100 shadow-xl rounded-2xl p-4">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
        aria-label="Close install prompt"
      >
        <HiOutlineXMark size={16} />
      </button>

      <p className="text-sm font-black text-gray-900 pr-8">Install MediTrack</p>
      <p className="text-xs text-gray-500 mt-1 mb-3">Add to your home screen for faster access.</p>

      <button
        onClick={handleInstall}
        className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
      >
        <HiOutlineArrowDownTray size={16} /> Install App
      </button>
    </div>
  );
};
