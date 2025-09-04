import { SELECTION_COLORS } from '@/constants/epub';

/**
 * Applies mobile styles to the document for better touch and selection handling.
 * @param document The document to apply styles to.
 * @returns A cleanup function to remove the styles.
 */
export const applyMobileStyles = (document: Document) => {
  const body = document.body;
  if (!body) return;

  // Enable text selection
  Object.assign(body.style, {
    webkitUserSelect: 'text',
    userSelect: 'text',
    webkitTouchCallout: 'default',
    touchAction: 'manipulation',
    webkitTapHighlightColor: 'transparent',
  });

  // Add selection styles
  const style = document.createElement('style');
  style.textContent = `
    ::selection {
      background-color: ${SELECTION_COLORS.BACKGROUND} !important;
      color: ${SELECTION_COLORS.TEXT_INHERIT} !important;
    }
    ::-webkit-selection, ::-moz-selection {
      background-color: ${SELECTION_COLORS.BACKGROUND} !important;
      color: ${SELECTION_COLORS.TEXT_INHERIT} !important;
    }
    
    *, p, div, span, h1, h2, h3, h4, h5, h6 {
      -webkit-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default !important;
    }
  `;
  document.head.appendChild(style);
};
