import { Injectable } from '@angular/core';
import { Config } from './types';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

export const Preset: Config = {
  includingScrollBar: false,
  showZoomedView: true,
  saveScreenshot: true,
  info: [],
  startHotKeys: [['AltLeft'], 'KeyO']
}

function getTypedVal(key: keyof Config, val: string): any {
  if (typeof Preset[key] === 'boolean') {
    return coerceBooleanProperty(val);
  }
}

@Injectable({
  providedIn: 'root'
})

export class LocalStorageService {
  constructor() { }

  public save(key: string, value: string): boolean {
    localStorage.setItem(key, value);
    return true;
  }

  /**
   * Use value from localStorage,
   * if not present, use from a preset.
   */
  public get(key: keyof Config): any {
    let strVal = localStorage.getItem(key);
    let val = null;
    if (strVal === null) {
      strVal = Preset[key].toString();
      val = getTypedVal(key, strVal)
      this.save(key, val);
    } else {
      val = getTypedVal(key, strVal)
    }
    return val;
  }

  public getAll(): Config {
    let res: any = {};
    Object.entries(Preset).forEach(([k, v], _) => res[k] = this.get(k as keyof Config));
    return res
  }
}
