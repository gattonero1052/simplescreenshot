import { STATE } from './types'
import { mouseDownReducer, mouseUpReducer, mouseMoveReducer, keyboardReducer } from './reducers'
import { Global as g } from './page';

/**
 * Dispatch event to handlers.
 * 
 * @return {boolean} return value for event handlers,
 *  false when browser behaviors are prevented, otherwise being true
 */
export function dispatch(event: UIEvent): boolean {
  let result = true;

  if(g.settingsLoading) return result;

  if (event instanceof MouseEvent) {
    if (event.type === 'mousemove') {
      result = mouseMoveReducer(event);
    } else if (event.type === 'mousedown') {
      result = mouseDownReducer(event);
    } else if (event.type === 'mouseup') {
      result = mouseUpReducer(event);
    }
  } else if (event instanceof KeyboardEvent) {
    result = keyboardReducer(event);
  }
  return result;
}