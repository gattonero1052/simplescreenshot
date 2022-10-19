import { STATE, MouseEventDetail } from '../types';
import { extractMouseEventDetail } from '../util';
import { Global as g,reselect } from '../page';

/**
 * Reducer for click event
 */

export const mouseDownReducer = (event: MouseEvent): boolean => {
  let detail = extractMouseEventDetail(event);
  switch (event.button) {
    case 0:
      switch (g.state) {
        case STATE.SELECTING:
          mouseDownOnMainButtonWileSelecting(detail);
          break;
      }
      break;
    case 2:
      switch (g.state) {
        case STATE.SELECTING:
          mouseDownOnSubButtonWileSelecting(detail);
          break;
      }
      break;
  }

  return true;
}

/**
 * Main handlers
 */

const mouseDownOnMainButtonWileSelecting = (detail: MouseEventDetail): void => {
  g.selectionStarted = true;
  g.screenshotStartPoint = { ...g.mousePos };
}

const mouseDownOnSubButtonWileSelecting = (detail: MouseEventDetail): void => {
  reselect();
}
