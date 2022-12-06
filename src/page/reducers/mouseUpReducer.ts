import { STATE, Rectangle, MouseEventDetail } from '../types';
import { extractMouseEventDetail } from '../util';
import { Global as g, reset, destroy } from '../page';
import { saveImage } from '../util';

/**
 * Reducer for click event
 */

export const mouseUpReducer = (event: MouseEvent) => {
  if (event.button === 2) return false;

  let detail = extractMouseEventDetail(event);

  switch (g.state) {
    case STATE.IDLE:
      mouseUpOnIdle(detail);
      break
    case STATE.SELECTING:
      mouseUpOnSelecting(detail);
      break;
    default: break;
  }

  return true;
}

/**
 * Main handlers
 */

const mouseUpOnIdle = (detail: MouseEventDetail): void => {
}

const mouseUpOnSelecting = (detail: MouseEventDetail): void => {
  if (g.currentSelectionCancelled) {
    g.currentSelectionCancelled = false;
    return;
  }

  if (!g.selectionStarted) {
    return;
  }

  g.state = STATE.COMPLETE;
  // here screenshotStartPoint could be ignored when mouse did't move
  let spotlight;
  let isScreenshotValid = true;

  if (g.mouseMoved) {
    if (!g.screenshotStartPoint || !g.screenshotEndPoint) {
      isScreenshotValid = false;
    } else {
      spotlight = {
        minX: Math.min(g.screenshotStartPoint.x, g.screenshotEndPoint.x),
        maxX: Math.max(g.screenshotStartPoint.x, g.screenshotEndPoint.x),
        minY: Math.min(g.screenshotStartPoint.y, g.screenshotEndPoint.y),
        maxY: Math.max(g.screenshotStartPoint.y, g.screenshotEndPoint.y),
      };
    }
  } else {
    spotlight = {
      minX: 0,
      maxX: window.innerWidth,
      minY: 0,
      maxY: window.innerHeight,
    }
  }

  if (isScreenshotValid && spotlight && spotlight.maxX > spotlight.minX && spotlight.maxY > spotlight.minY) {
    showOptions(spotlight);
  } else {
    // console.error('error getting selected area');
    reset();
    destroy();
  }
}

// TODO functional buttons
const mouseUpOnComplete = (detail: MouseEventDetail): void => {
}

/**
 * TODO: Show options after selecting screenshot area.
 * Currently, just save image and reset screenshot.
 * @param {Rectangle} spotlight spolight rectangle
 */
function showOptions(spotlight: Rectangle) {
  saveImage(spotlight, g.imageData);
  reset();
  destroy();
}