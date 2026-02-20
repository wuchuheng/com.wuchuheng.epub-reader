import { useEffect } from 'react';
import { useAppSelector } from '../store';
import { FONT_OPTIONS } from '../config/fonts';

/**
 * Hook to apply the selected font family globally via CSS variables
 * and inject the necessary font stylesheets into the document head.
 */
export const useGlobalFont = () => {
  const { fontFamily: fontId } = useAppSelector((state) => state.settings.typography);

  useEffect(() => {
    const selectedFont = FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0];
    
    // 1. Update CSS variable for the entire app, ensuring emoji fallback
    document.documentElement.style.setProperty(
      '--app-font-family', 
      `${selectedFont.family}, "Apple Color Emoji", "Segoe UI Emoji"`
    );

    // 2. Manage Font Stylesheet
    const linkId = 'global-font-stylesheet';
    let linkElement = document.getElementById(linkId) as HTMLLinkElement;

    if (selectedFont.url) {
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = linkId;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      linkElement.href = selectedFont.url;
    } else if (linkElement) {
      linkElement.remove();
    }
  }, [fontId]);
};
