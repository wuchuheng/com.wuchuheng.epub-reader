import { logger } from '@/utils/logger';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { handleSelectionEnd } from './selection.service';
import { Contents } from 'epubjs';

export const handleComputerSelection = (props: SetupRenditionEventsProps, iframeView: Contents) => {
  props.rendition.on('touchend', () => {
    logger.log('Touch end event detected');

    const doc = iframeView.document;
    handleSelectionEnd(doc, props.onSelectionCompleted);
  });

  props.rendition.on('mouseup', (_event: MouseEvent) => {
    logger.log(`Mouse up event detected`);
    const doc = iframeView.document;
    handleSelectionEnd(doc, props.onSelectionCompleted);
  });
};
