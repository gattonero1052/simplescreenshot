import * as twgl from 'twgl.js';
import { Rectangle } from '../types';
import { Global as g } from '../page';
import * as m3 from '../m3';
import { STATE } from '../types';

/**
 * Render a rectangle using given position matrix and texture matrix.
 */
function renderRectangle(pos_matrix: Float32Array, tex_matrix: Float32Array,
  texture: WebGLTexture, showSpotLight: boolean) {
  if (!g.gl) return;

  let spotlight = showSpotLight && g.screenshotEndPoint && g.screenshotStartPoint ? {
    minX: Math.min(g.screenshotStartPoint.x, g.screenshotEndPoint.x),
    maxX: Math.max(g.screenshotStartPoint.x, g.screenshotEndPoint.x),
    minY: Math.min(g.screenshotStartPoint.y, g.screenshotEndPoint.y),
    maxY: Math.max(g.screenshotStartPoint.y, g.screenshotEndPoint.y),
  } : { minX: 0, maxX: g.width, minY: 0, maxY: g.height };

  twgl.setBuffersAndAttributes(g.gl, g.programInfo, g.bufferInfo);
  twgl.setUniforms(g.programInfo, {
    u_resolution: g.u_resolution, u_pos_matrix: pos_matrix, u_tex_matrix: tex_matrix,
    u_texture: texture, u_spotlight: [
      (spotlight.minX / g.width - .5) * 2,
      (spotlight.maxX / g.width - .5) * 2,
      (spotlight.minY / g.height - .5) * 2,
      (spotlight.maxY / g.height - .5) * 2,
    ]
  });
  twgl.drawBufferInfo(g.gl, g.bufferInfo);
}

export function render() {
  if (!g.gl) return;
  let gl = g.gl;

  twgl.resizeCanvasToDisplaySize(g.gl.canvas);

  renderRectangle(...getRectangleMatrix({
    x: 0, y: 0, width: g.width, height: g.height
  }), g.textures.bg, g.mouseMoved);

  if (g.imageData) {
    if (g.state === STATE.SELECTING && g.mouseMoved && g.showZoomedView) {
      renderRectangle(...getZoomedInAreaMatrix({
        x: g.mousePos.x, y: g.mousePos.y, width: g.previewWidth / g.zoomedScaleX,
        height: (g.previewHeight - g.infoHeight) / g.zoomedScaleY,
        scaleX: g.zoomedScaleX, scaleY: g.zoomedScaleY,
        targetX: g.previewPos.x, targetY: g.previewPos.y
      }), g.textures.bg, false);
    }
  } else {
    if (!g.firstTimeRenderTimer) g.firstTimeRenderTimer = setTimeout(() => {
      let w = window.innerWidth, h = window.innerHeight;
      let buffer = new Uint8Array(w * h * 4);

      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
      g.imageData = new ImageData(new Uint8ClampedArray(buffer), w, h);
      g.state = STATE.SELECTING;
    }, g.timeToWaitForImageData);
  }

  g.requestAnimationFrameId = requestAnimationFrame(render);
}

/**
 * Get pos matrix and tex matrix for a rectangle area.
 * 
 * x,y,targetX,targetY are coordinates based on
 * x axis stretch from bottom left to bottom right, and
 * y axis stretch from bottom left to top left.
 * 
 * @param {number} x x coordinate of the rectangle's bottom left corner
 * @param {number} y y coordinate of the rectangle's bottom left corner
 * @param {number} width rectangle width
 * @param {number} height rectangle height
 */
function getRectangleMatrix({ x, y, width, height }: { x: number, y: number, width: number, height: number }):
  [Float32Array, Float32Array] {
  let w = g.width, h = g.height;
  let pos_matrix = m3.identity();
  pos_matrix = m3.multiply(pos_matrix, m3.translation((x - (w - width) / 2) / w * 2,
    (y - (h - height) / 2) / h * 2));
  pos_matrix = m3.multiply(pos_matrix, m3.scaling(width / w, height / h));
  return [pos_matrix, m3.identity()];
}

/**
 * Get pos matrix and tex matrix for a zoomed-in area.
 * 
 * x,y,targetX,targetY are coordinates based on
 * x axis stretch from bottom left to bottom right, and
 * y axis stretch from bottom left to top left.
 * 
 * @param {number} x x coordinate of zoomed area position's center in the texture
 * @param {number} y y coordinate of zoomed area position's center in the texture
 * @param {number} width width of zoomed area in the texture
 * @param {number} height height of zoomed area in the texturez
 * @param {number} scaleX zoom scale in x direction
 * @param {number} scaleY zoom scale in y direction
 * @param {number} targetX x coordinate of where to put the zoomed area in the canvas
 * @param {number} targetY y coordinate of where to put the zoomed area in the canvas
 */
function getZoomedInAreaMatrix({ x, y, width, height, scaleX, scaleY, targetX, targetY }:
  {
    x: number, y: number, width: number, height: number,
    scaleX: number, scaleY: number, targetX: number, targetY: number
  }): [Float32Array, Float32Array] {
  x -= width / 2;
  y -= height / 2;
  let w = g.width, h = g.height;
  let tex_matrix = m3.identity();
  tex_matrix = m3.multiply(tex_matrix, m3.translation(x / w, y / h));
  tex_matrix = m3.multiply(tex_matrix, m3.scaling(width / w, height / h));

  let pos_matrix = m3.identity();
  pos_matrix = m3.multiply(pos_matrix, m3.scaling(scaleX * width / w, scaleY * height / h));
  pos_matrix = m3.multiply(pos_matrix, m3.translation((targetX - w / 2) / (scaleX * width / 2),
    (targetY - h / 2) / (scaleY * height / 2)));
  return [pos_matrix, tex_matrix];
}

/**
 * @param {object} preview preview rectangle
 * @param {object} info info rectangle
 * @param {x} number mouse position text for x coordinate
 * @param {y} number mouse position text for y coordinate
 * @param {r} number RGB color value of red (0-255)
 * @param {g} number RGB color value of green (0-255)
 * @param {b} number RGB color value of blue (0-255)
 */
export function renderHTMLElements({ preview, info }: { preview: Rectangle, info: Rectangle },
  { x, y, R, G, B }: { x: number, y: number, R: number, G: number, B: number }) {
  const body = document.body;
  let previewEl = g.previewEl, infoEl = g.infoEl,
    subInfoPosEl = g.subInfoPosEl,
    subInfoColorEl = g.subInfoColorEl,
    cursorEl = g.cursorEl;
  ;

  if (!g.previewEl) {
    g.previewEl = previewEl = document.createElement('div');
    g.infoEl = infoEl = document.createElement('div');
    g.subInfoPosEl = subInfoPosEl = document.createElement('div');
    g.subInfoColorEl = subInfoColorEl = document.createElement('div');
    g.cursorEl = cursorEl = [document.createElement('div'), document.createElement('div'),
    document.createElement('div'), document.createElement('div')];
    g.previewEl = previewEl;
    g.infoEl = infoEl;
    subInfoPosEl.setAttribute('data-type', 'pos');
    subInfoColorEl.setAttribute('data-type', 'color');
    document.body.appendChild(previewEl)
    document.body.appendChild(infoEl)
    infoEl.appendChild(subInfoPosEl)
    infoEl.appendChild(subInfoColorEl)

    cursorEl.forEach(el => {
      if (previewEl) previewEl.appendChild(el);
    });
  }

  const cursorDimensions = [[g.cursorWidth, g.cursorLength, 0, 1],
  [g.cursorLength, g.cursorWidth, 1, 0], [g.cursorWidth, g.cursorLength, 0, -1],
  [g.cursorLength, g.cursorWidth, -1, 0]];
  const centerLeft = (preview.maxX - preview.minX >> 1),
    centerTop = (preview.maxY - preview.minY - info.maxY + info.minY >> 1);
  const cursorOffset = g.cursorLength / 2 + g.cursorCenterDist;

  if (cursorEl)
    cursorEl.forEach((el: any, i) => {
      let [width, height, centerXI, centerYI] = cursorDimensions[i];
      el.style.cssText = `
      position: absolute;
      background: black;
      opacity: .4;
      width: ${width}px;
      height: ${height}px;
      left: ${centerLeft + centerXI * (cursorOffset) - width / 2}px;
      top: ${centerTop - centerYI * (cursorOffset) - height / 2}px;
      `;
    });

  if (previewEl && infoEl && subInfoPosEl && subInfoColorEl) {
    setElementStyle(previewEl, preview, `
    z-index:2147483647;
    box-sizing: border-box;
    border: 2px solid black;`);
    setElementStyle(infoEl, info, `
    z-index:2147483647;
    background: #222;
    color: #ddd;
    box-sizing: border-box;
    height: 40px;
    display: flex;
    padding:2px;
    flex-direction: column;
    justify-content:center;
    font-size:11px;
    font-family: open sans,Arial,sans-serif;`);
    subInfoPosEl.style.cssText = `
    padding: 0 5px;
    `;
    subInfoColorEl.style.cssText = `
    padding: 0 5px;
    `;
    subInfoPosEl.innerHTML = `X: ${x} Y: ${window.innerHeight - y}`;

    if(R===undefined || G === undefined || B === undefined){
      subInfoColorEl.style.display = 'none';
    }else{
      subInfoColorEl.style.display = 'inherit';
    }

    subInfoColorEl.innerHTML = `RGB: ${R}, ${G}, ${B}`;
  }
}

/**
 * Apply position to html element in place
 * 
 * @param {HTMLElement} htmlElement
 * @param {object} rectangle
 * @return {void}
 */
function setElementStyle(htmlElement: HTMLElement, rectangle: Rectangle, extraStyle = '') {
  htmlElement.style.cssText = `
  width: ${rectangle.maxX - rectangle.minX}px;
  height: ${rectangle.maxY - rectangle.minY}px;
  position: fixed;
  left: ${rectangle.minX}px;
  bottom: ${rectangle.minY}px;
  ${extraStyle}
`;
}