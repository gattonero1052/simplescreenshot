import { dispatch } from './dispatch';
import { STATE, Rectangle, Point } from './types';

const infoHeight = 40, previewWidth = 120, previewHeight = 120 + infoHeight, previewMinDist = 20;
const previewOffsetX = previewMinDist + previewWidth / 2, previewOffsetY = previewMinDist + previewHeight / 2;
const zoomedScaleX = 2, zoomedScaleY = 2;
const cursorLength = 10, cursorWidth = 2, cursorCenterDist = 4;


const DEFAULT_GLOBAL = {
  state: STATE.IDLE,
  firstTimeRenderTs: 0,
  timeToWaitForImageData: 200,
  selectionStarted: false,
  mouseMoved: false,
  currentSelectionCancelled: false,
  infoHeight,
  previewWidth,
  previewHeight,
  previewMinDist,
  previewOffsetX,
  previewOffsetY,
  zoomedScaleX,
  zoomedScaleY,
  cursorLength,
  cursorWidth,
  cursorCenterDist,

  width: 0,
  height: 0,

  selectedArea: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  },
  mousePos: {
    x: 0,
    y: 0,
  },
  previewPos: {
    x: 0,
    y: 0,
  },

  documentBodyOriginalOverflow: '',

  settingsLoading: false,
  includingScrollBar: false,
  showZoomedView: true,
  saveScreenshot: true,

  startHotKeys: [['AltLeft'], 'KeyO'],
  websiteUrl: ''
};

export let Global: {
  twgl?: any
  UNIT_QUAD?: any
  u_resolution?: any
  imageData?: ImageData
  state: STATE
  canvas?: HTMLCanvasElement | null
  gl?: WebGLRenderingContext | null
  programInfo?: any
  bufferInfo?: any
  textures?: any
  width: number
  height: number
  firstTimeRenderTs: number
  timeToWaitForImageData: number
  firstTimeRenderTimer?: ReturnType<typeof setTimeout>
  selectionStarted: boolean
  mouseMoved: boolean
  currentSelectionCancelled: boolean
  screenshotStartPoint?: Point
  screenshotEndPoint?: Point

  infoHeight: number
  previewWidth: number
  previewHeight: number
  previewMinDist: number
  previewOffsetX: number
  previewOffsetY: number
  zoomedScaleX: number
  zoomedScaleY: number
  cursorLength: number
  cursorWidth: number
  cursorCenterDist: number
  requestAnimationFrameId?: number

  selectedArea: Rectangle
  mousePos: Point
  previewPos: Point

  previewEl?: HTMLElement
  infoEl?: HTMLElement
  subInfoPosEl?: HTMLElement
  subInfoColorEl?: HTMLElement
  cursorEl?: HTMLElement[]

  documentBodyOriginalOverflow: string

  settingsLoading: boolean
  includingScrollBar: boolean
  showZoomedView: boolean
  saveScreenshot: boolean
  startHotKeys: any[]

  websiteUrl: string
} = JSON.parse(JSON.stringify(DEFAULT_GLOBAL));

async function loadSettings() {
  Global.settingsLoading = true;
  let { includingScrollBar, showZoomedView, saveScreenshot, startHotKeys } = await chrome.storage.local.get(['includingScrollBar', 'showZoomedView', 'saveScreenshot', 'startHotKeys']);
  if (includingScrollBar !== undefined)
    Global.includingScrollBar = includingScrollBar;

  if (showZoomedView !== undefined)
    Global.showZoomedView = showZoomedView;

  if (saveScreenshot !== undefined)
    Global.saveScreenshot = saveScreenshot;

  if (startHotKeys !== undefined)
    Global.startHotKeys = startHotKeys;
  Global.settingsLoading = false;
  console.log(Global,startHotKeys);
}

/**
 * Clear variables and go back to the original state.
 */
export function reset() {
  Global.state = STATE.IDLE;
  Global.selectionStarted = false;
  Global.mouseMoved = false;
  Global.currentSelectionCancelled = false;
  Global.firstTimeRenderTs = 0;
  Global.timeToWaitForImageData = 200;
  Global.firstTimeRenderTimer = undefined;
  Global.screenshotStartPoint = undefined;
  Global.screenshotEndPoint = undefined;
}

/**
 * When do selecting, cancel current selecting before release mouse button
 * and allow user re-select a new area.
 */
export function reselect() {
  Global.selectionStarted = false;
  Global.currentSelectionCancelled = true;
  Global.mouseMoved = false;
  Global.screenshotStartPoint = { x: 0, y: 0 };
  Global.screenshotEndPoint = { x: window.innerWidth, y: window.innerHeight };
}

/**
 * Stop render loop
 * Release memory.
 * Not keeping the canvas to remove the listeners together.
 */
export function destroy() {
  if (Global.requestAnimationFrameId)
    window.cancelAnimationFrame(Global.requestAnimationFrameId);
  if (Global.canvas)
    document.body.removeChild(Global.canvas);
  if (Global.previewEl)
    document.body.removeChild(Global.previewEl);
  if (Global.infoEl)
    document.body.removeChild(Global.infoEl);
  // Global.canvas = undefined;
  // Global.textures = undefined;
  // Global.programInfo = undefined;
  // Global.imageData = undefined;
  // Global.bufferInfo = undefined;
  // Global.gl = undefined;
  // Global.previewEl = undefined;
  // Global.infoEl = undefined;
  // Global.previewEl = undefined;
  // Global.subInfoPosEl = undefined;
  // Global.subInfoColorEl = undefined;
  // Global.cursorEl = undefined;
  document.body.style.overflow = Global.documentBodyOriginalOverflow;
  loadSettings()
  Global = JSON.parse(JSON.stringify(DEFAULT_GLOBAL));
}

; (async function () {
  await loadSettings();
  document.body.addEventListener('keydown', dispatch);
})();