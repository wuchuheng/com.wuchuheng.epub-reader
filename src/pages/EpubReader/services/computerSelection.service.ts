import { logger } from '@/utils/logger';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { handleSelectionEnd } from './selection.service';
import { Contents } from 'epubjs';
import { debounce } from '@wuchuheng/helper';

export const handleComputerMouseDownAndUpEvent = (
  props: SetupRenditionEventsProps,
  iframeView: Contents
) => {
  props.rendition.on('touchend', () => {
    if (props.isMenuOpenRef.current) {
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
    if (props.isMenuOpenRef.current) {
      logger.log('Mouse selection disabled - context menus are open');
      return;
    }
    const doc = iframeView.document;
    debounceHandleSelection({ doc, event, props });
  });
};

const debounceHandleSelection = debounce(
  ({
    doc,
    event,
    props,
  }: {
    doc: Document;
    event: MouseEvent;
    props: SetupRenditionEventsProps;
  }) => {
    logger.log(`Mouse up event detected`);
    handleSelectionEnd(
      doc,
      props.onSelectionCompleted,
      //  Process click event
      () => {
        if (props.isMenuOpenRef.current) {
          return;
        }
        props.onClick?.();
      },

      { x: event.clientX, y: event.clientY }
    );
  },
  10
);
