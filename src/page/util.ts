import { Rectangle, MouseEventDetail, KeyEventDetail, Point } from './types';
import { Global as g } from './page';
import * as md5 from 'crypto-js/md5.js';
import * as CryptoJS from 'crypto-js';

const CONTROL_KEYS = ['ControlLeft', 'AltRight', 'Meta', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft'];
const KEYS_SHOWMAP = {
  'ControlLeft': 'Ctrl',
  'ControlRight': 'Ctrl',
  'AltLeft': 'Alt',
  'AltRight': 'Alt',
  'ShiftLeft': 'Shift',
  'ShiftRight': 'Shift',
  'BracketLeft': '{',
  'BracketRight': '}',
  'Backslash': '\\',
  'Minus': '-',
  'Equal': '=',
  'Backquote': '`',
  'Semicolon': ';',
  'Quote': "'",
  'Comma': ",",
  'Period': ".",
  'Slash': "/",
};

const EVENT_KEY = {
  'Ctrl': 'ctrlKey',
  'Alt': 'altKey',
  'Shift': 'shiftKey',
}

const DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

function keyCodeTriggerPredictor(keyCombo: any[], event: KeyboardEvent) {
  console.log(keyCombo,event);
  let [controlKeys, finalKey] = keyCombo;
  return controlKeys.every((key: any) => (event as any)[(EVENT_KEY as any)[(KEYS_SHOWMAP as any)[key]]])
    && event.code === finalKey
}

export const extractMouseEventDetail = (event: MouseEvent) => ({
  x: event.clientX,
  y: event.clientY,
  isMove: !(event instanceof PointerEvent),
  isClick: event instanceof PointerEvent && event.type === 'mousedown',
})

export const extractKeyEventDetail = (event: KeyboardEvent) => ({
  isStart: keyCodeTriggerPredictor(g.startHotKeys, event),
  isEnter: event.code === 'Enter',
  isEscape: event.code === 'Escape',
})

export function saveImage(spotlight: Rectangle, imageData?: ImageData) {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('error getting canvas context');
    return;
  }

  if (!imageData) {
    console.error('error getting image data');
    return;
  }

  let w = window.innerWidth, h = window.innerHeight;
  let width = spotlight.maxX - spotlight.minX,
    height = spotlight.maxY - spotlight.minY;
  let arr = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      for (let k = 0; k < 4; k++) {
        arr[((height - 1 - i) * width + j) * 4 + k] = imageData.data[((i + spotlight.minY) * w + j + spotlight.minX) * 4 + k]
      }
    }
  }

  let clampedImageData = new ImageData(arr, width, height);
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(clampedImageData, 0, 0);
  if (g.saveScreenshot) {
    asyncSaveInfo(g.websiteUrl, canvas.toDataURL());
  }

  canvas.toBlob(function (blob) {
    if (blob)
      window.navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
  });
}

/**
 * @param {number} mouse.x
 * @param {number} mouse.y
 * @param {number} background.width
 * @param {number} background.height
 * 
 * @returns {preview} A rectangle for preview position
 * @returns {info} A rectangle including the info below
 */
export function getZoomedPreviewElementPosition(mouse: Point, background: { width: number, height: number }) {
  let preview: Rectangle = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let hasRes = false;

  for (let i = 0; i < 2 && !hasRes; i++)
    for (let j = 0; j < 2 && !hasRes; j++) {
      let centerX = mouse.x + g.previewOffsetX * (1 - 2 * i), centerY = mouse.y + g.previewOffsetY * (1 - 2 * j);
      preview.minX = centerX - g.previewWidth / 2;
      preview.maxX = centerX + g.previewWidth / 2;
      preview.minY = centerY - g.previewHeight / 2;
      preview.maxY = centerY + g.previewHeight / 2;
      if (preview.minX >= g.previewMinDist && preview.minY >= g.previewMinDist &&
        preview.maxY <= background.height - g.previewMinDist && preview.maxX <= background.width - g.previewMinDist) {
        hasRes = true
      }
    }

  let info: Rectangle = {
    ...preview,
    maxY: preview.minY + g.infoHeight
  }

  return { preview, info };
}

/**
 * Save screenshot info, which including:
 * - website (current url address)
 * - ImageData object
 */
async function asyncSaveInfo(website: string, base64: string) {
  let res = await chrome.storage.local.get(['info']);
  let info = res ? res['info'] : [];
  let ts = new Date().getTime();
  let id = md5(website + ts).toString(CryptoJS.enc.Hex);
  info.push({
    website,
    ts,
    id
  });
  let saveRes = await chrome.storage.local.set({ info });
  saveRes = await chrome.storage.local.set({ [`screenshot-${id}`]: base64 });
  console.log('set data success', base64, id, saveRes);
}


//TODO restrict screenshot again to prevent bugs
//TODO Why chrome will auto clear storage.local?
//TODO add source links & support links & version