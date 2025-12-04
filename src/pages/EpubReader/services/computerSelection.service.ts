import { logger } from '@/utils/logger';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { handleSelectionEnd } from './selection.service';
import { Contents } from 'epubjs';

export const handleComputerMouseDownAndUpEvent = (
  props: SetupRenditionEventsProps,
  iframeView: Contents
) => {
  props.rendition.on('touchend', () => {
    if (!props.selectionEnabled) {
      logger.log('Touch selection disabled - context menus are open');
      return;
    }

    logger.log('Touch end event detected');

    const doc = iframeView.document;
    handleSelectionEnd(
      doc,
      props.onSelectionCompleted,
      //  Process click event
      () => {
        props.onClick?.();
      }
    );
  });

  props.rendition.on('mouseup', (event: MouseEvent) => {
    if (!props.selectionEnabled) {
      logger.log('Mouse selection disabled - context menus are open');
      return;
    }

    logger.log(`Mouse up event detected`);
    const doc = iframeView.document;
    handleSelectionEnd(
      doc,
      props.onSelectionCompleted,
      //  Process click event
      () => {
        props.onClick?.();
      },

      { x: event.clientX, y: event.clientY }
    );
  });
};
