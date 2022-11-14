let finalCode = '';
const controlCodes = new Set<string>();
const codes = new Set<string>();
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

type KEYS = keyof typeof KEYS_SHOWMAP;

const CLEAR_KEY = ['Backspace'];

let options: {
  setElValue: boolean
  initialValue?: [any[], any]
  onBlur?: (...args: any[]) => any
  onFocus?: (...args: any[]) => any
} = {
  setElValue: true,
  initialValue: undefined,
  onBlur: undefined,
  onFocus: undefined
}

function debounce(fn: (...args: any[]) => any, interval: number = 200) {
  let lastCall: ReturnType<typeof setTimeout>, lastCallTs: number, lastFn: () => any;
  return [function (...args: any[]) {
    let time = new Date().getTime();

    if (time - lastCallTs < interval) {
      clearTimeout(lastCall);
    }

    lastCallTs = time;
    lastFn = () => {
      fn(...args);
    };
    lastCall = setTimeout(lastFn, interval);
  }, () => {
    if (lastCall) {
      clearTimeout(lastCall);
      lastFn();
      lastCallTs = 0;
    }
  }];
}

function orderControlCodes(keys: Set<string>) {
  let res = [];
  for (let key of CONTROL_KEYS) {
    if (keys.has(key)) {
      res.push(key);
    }
  }
  return res;
}

function isControlKey(key: string) {
  return CONTROL_KEYS.indexOf(key) !== -1;
}

function showResult(el: HTMLElement, [controlCodes = [], finalCode]: [any[], any]) {
  controlCodes = controlCodes.map(e => e in KEYS_SHOWMAP ? KEYS_SHOWMAP[e as KEYS] : e);
  finalCode = finalCode in KEYS_SHOWMAP ? KEYS_SHOWMAP[finalCode as KEYS] :
    finalCode.indexOf('Key') === 0 ? finalCode.substr(3) :
      finalCode.indexOf('Digit') === 0 ? finalCode.substr(5) :
        finalCode;
  let str = `${controlCodes.join(' ')}${finalCode ? controlCodes.length ? ' + ' + finalCode : finalCode : ''}`;

  if (options.setElValue) {
    (el as any).value = str;
  }
}

function getAndShowResult(controlCodes: Set<string>, finalCode: any, el: HTMLElement, callback: (...args: any[]) => any) {
  let result: [any[], any] = [orderControlCodes(controlCodes), finalCode]
  showResult(el, result);
  callback(result);
  return result;
}

function reset() {
  controlCodes.clear();
  finalCode = '';
}
/**
 * Make an input element to function as a "hotkey binder".
 * @param el input element to be bounded
 * @param _callback callback function when user has confirmed a key combo
 *  codes example: [['ControlLeft','AltLeft'],'K']
 * As a default option, it will set value when key is bound to the input element.
 */
function bind(el: HTMLInputElement, _callback: (...args: any[]) => any, _options: Record<any, any> = {}) {
  for (let key in _options) {
    if (key in options) {
      (options as any)[key] = _options[key];
    }
  }

  let result: [any[], any] | undefined;

  //here 500 is quite reasonable because
  //user can't make two reasonable operations in a row while pressing some keys
  //only the last one will count.
  let [callback, executeLastCallback] = debounce(_callback, 500);
  el.setAttribute('readonly', 'readonly');
  if (options.initialValue && options.initialValue.length) {
    showResult(el, options.initialValue);
  }

  if (options.onFocus) {
    el.addEventListener('focus', options.onFocus);
  }

  el.addEventListener('keydown', ({ code }) => {
    //reset if there is not key pressing
    if (code === 'Enter') {
      el.blur();
      if (options.onBlur) {
        options.onBlur();
      }
      return;
    }

    if (codes.size === 0) {
      reset();
    }
    codes.add(code);
    if (CLEAR_KEY.indexOf(code) > -1) {
      reset();
      result = getAndShowResult(controlCodes, finalCode, el, callback);
    } else {
      if (isControlKey(code))
        controlCodes.add(code);
      else
        finalCode = code;
      result = getAndShowResult(controlCodes, finalCode, el, callback);
    }
  });

  // Here it's possible that keyup event is not captured,  
  // for example pressing ctrl + l, address bar then get focused
  // if you release ctrl then, there is no way this event
  // is captured.
  // so backspace is reserved as a clear key.
  // surely there will be some other solutions
  // such as set time a maximum time for holding one key
  // but that's trivially complex.
  let [afterKeyUp, executeLastAfterUp] = debounce(() => {
    if (controlCodes.size) {
      getAndShowResult(controlCodes, finalCode, el, callback);
    }
  }, 100);

  el.addEventListener('keyup', ({ code }) => {
    codes.delete(code);
    if (CLEAR_KEY.indexOf(code) === -1) {
      if (isControlKey(code)) {
        controlCodes.delete(code);
      }

      //if no key is pressing and there is a event in the debounce queue,
      //then execute that event right now, which means we need to save
      //user's last operation right now because he is releasing the keyboard.
      if (codes.size) {
        afterKeyUp();
      } else {
        executeLastAfterUp();//just for release;
        executeLastCallback();
      }
    }
  });
}

export const createHotKeyBinder = bind