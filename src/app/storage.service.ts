import { Injectable } from '@angular/core';
import { Config } from './types';

export const Preset: Config = {
  includingScrollBar: false,
  showZoomedView: true,
  saveScreenshot: true,
  info: [],
  startHotKeys: [['AltLeft'], 'KeyO']
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public async save(key: string, value: any) {
    await chrome.storage.local.set({ [key]: value });
  }

  public async get(key: string): Promise<any> {
    let result = await chrome.storage.local.get([key]);
    let value = result[key];
    if (value === undefined) {
      if (Preset.hasOwnProperty(key)) {
        value = Preset[key as keyof Config];
      }
      await chrome.storage.local.set({ [key]: value });
    }
    return value;
  }

  public async getAll(): Promise<Config> {
    let res: any = {};
    for (const [k, v] of Object.entries(Preset)) {
      res[k] = await this.get(k as keyof Config);
    }
    return res
  }

  public async deleteAll(): Promise<void> {
    return await chrome.storage.local.clear();
  }
}
