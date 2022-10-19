import { STATE, MouseEventDetail, Point } from '../types'
import { extractMouseEventDetail, getZoomedPreviewElementPosition } from '../util';
import { Global as g } from '../page';
import { renderHTMLElements } from '../renderer';

/**
 * Reducer for mousemove event
 */

export const mouseMoveReducer = (event: MouseEvent): boolean => {
  let detail = extractMouseEventDetail(event);

  switch (g.state) {
    case STATE.IDLE:
      mousemoveOnIdle(detail);
      break
    case STATE.SELECTING:
      mousemoveOnSelecting(detail)
      break;
    default: break;
  }

  return false;
}

/**
 * Need to track the mouse position even in idle state.
 * For example
 *  when start key comb triggered without moving mouse
 *  there should be a preview element rendered beside 
 *  the mouse.
 */
function mousemoveOnIdle({ x, y }: MouseEventDetail) {
  let index = (y * window.innerWidth + x) * 4;
  y = window.innerHeight - y;
  g.mousePos.x = x;
  g.mousePos.y = y;
}

function mousemoveOnSelecting({ x, y }: MouseEventDetail) {
  y = window.innerHeight - y;
  mouseMoveEventHandler({ x, y });
}

export function mouseMoveEventHandler({ x, y }: Point) {
  let index = (y * window.innerWidth + x) * 4;
  let R = 0, G = 0, B = 0;
  if (g.imageData) {
    R = g.imageData.data[index];
    G = g.imageData.data[index + 1];
    B = g.imageData.data[index + 2];
  }
  g.mousePos.x = x;
  g.mousePos.y = y;
  g.mouseMoved = true;
  if (g.selectionStarted) {
    g.screenshotEndPoint = { ...g.mousePos };
  }
  let { preview, info } = getZoomedPreviewElementPosition({ x, y }, { width: window.innerWidth, height: window.innerHeight });
  g.previewPos.x = (preview.maxX + preview.minX) >> 1;
  g.previewPos.y = (preview.maxY + preview.minY + g.infoHeight) >> 1;
  if(g.showZoomedView) renderHTMLElements({ preview, info }, { x, y, R, G, B });
}