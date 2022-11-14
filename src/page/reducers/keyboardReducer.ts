import { STATE, KeyEventDetail } from '../types';
import { extractKeyEventDetail } from '../util';
import { dispatch } from '../dispatch';
import { Global as g, reselect, destroy, reset } from '../page';
import { render } from '../renderer';
import * as twgl from 'twgl.js';
import vertexShaderSource from '../renderer/main.vert';
import fragShaderSource from '../renderer/main.frag';

/**
 * Keyboard reducer, since querying from chrome local storage doesn't
 * take much effort, keyOnIdle is called asynchronously.
 * 
 * Do not fetch config from content script to make the config
 * effective without refreshing the page.
 */
export const keyboardReducer = (event: KeyboardEvent): boolean => {
  let detail = extractKeyEventDetail(event);
  switch (g.state) {
    case STATE.IDLE:
      keyOnIdle(detail);//no await
      break
    case STATE.SELECTING:
      keyOnSelecting(detail);
      break;
    default:
      keyOnOtherState(detail);
      break;
  }
  return true;
}

/**
 * Things to do when pressing the start key combo in idle state:
 * 
 * 1. Init WebGL canvas, context and configs. (Skip if they already exist.)
 * 2. Let service worker to take a screenshot.
 * 3. Once receive the screenshot, start rendering
 *    and save buffer to `imageData`. (It may take some time before buffers 
 *    are filled, didn't found a callback for that, 
 *    so wait for a certain amount of time.)
 * 4. End loading when `imageData` is ready.
 */
const keyOnIdle = async (detail: KeyEventDetail) => {
  if (detail.isEscape) {
    reset();
    destroy();
    return;
  }

  //start render elements
  if (detail.isStart) {
    if (!g.canvas) {
      await prepareCanvasAndConfig();
      setTimeout(() => {
        initWebGL();
        prepareRender();
      }, 100);
    }
  }
}

/**
 * Re-select area when pressing escape.
 */
function keyOnSelecting(detail: KeyEventDetail): void {
  if (detail.isEscape) {
    reset();
    destroy();
  }
}

function keyOnOtherState(detail: KeyEventDetail): void {
  if (detail.isEscape) {
    reset();
    destroy();
  }
}

/**
 * Set up canvas, remove scroll bar on body.
 * 
 * Since result of removing is reflected in the next rendering loop,
 * here we do the next step in a separate macrotask.
 * 
 * TODO: find a better way to set zindex?
 */
async function prepareCanvasAndConfig() {
  g.width = window.innerWidth;
  g.height = window.innerHeight;
  g.documentBodyOriginalOverflow = document.body.style.overflow;
  if (!g.includingScrollBar)
    document.body.style.overflow = 'hidden';
  g.canvas = document.createElement('canvas');
}

function initWebGL() {
  if (!g.canvas) return;
  let canvas = g.canvas;
  document.body.appendChild(g.canvas);
  canvas.style.cssText = `
  position: fixed;
  left: 0;
  top: 0;
  z-index:2147483647;`;
  canvas.width = g.width;
  canvas.height = g.height;

  let gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

  g.gl = gl;
  g.canvas.addEventListener('mousemove', dispatch);
  g.canvas.addEventListener('mousedown', dispatch);
  g.canvas.addEventListener('mouseup', dispatch);
  g.canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  if (!gl) return;

  let UNIT_QUAD = g.UNIT_QUAD = [
    0, 0,
    g.width, 0,
    0, g.height,
    0, g.height,
    g.width, 0,
    g.width, g.height,
  ];

  g.u_resolution = new Float32Array([g.width, g.height]);

  twgl.setDefaults({ attribPrefix: "a_" });

  let programInfo = g.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragShaderSource]);
  let bufferInfo = g.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [...UNIT_QUAD] },
    texcoord: { numComponents: 2, data: [...UNIT_QUAD] },
  });

  gl.useProgram(programInfo.program);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

/**
 * Send message to background script,
 * register message listener.
 */
function prepareRender() {
  let gl = g.gl;
  chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
    if (message.name === 'screenshotUrl' && message.dataUrl) {
      if (!gl) return;
      g.websiteUrl = message.websiteUrl;
      g.textures = twgl.createTextures(gl, {
        bg: { src: message.dataUrl, mag: gl.NEAREST, min: gl.NEAREST },
      })
      g.requestAnimationFrameId = requestAnimationFrame(render);
    }

    senderResponse('Tnit webgl complete, sent message to service worker.');
  });

  chrome.runtime.sendMessage({ name: 'startScreenshot' });
}