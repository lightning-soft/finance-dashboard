import { Executor } from 'global-handler';
import { EVENTS } from './enums';
import { Bounds, Options, saveData } from './types';

export interface IWindowManager {
  container: HTMLElement;
  windows: IWindow[];
  activeWindow: IWindow;
  bounds: Bounds;

  createWindow(option: object): IWindow;
  save(): saveData;
}

export interface IWindow {
  id: number;
  x: number;
  y: number;
  active: boolean;
  bounds: Bounds;
  type: any;
  ignoreOffset: number;
  keepInside: boolean;
  maximized: boolean;
  minimized: boolean;
  options: Options;
  wm: IWindowManager;
  _container: HTMLElement;

  on(event: EVENTS, fn: Executor): void;
  setTitle(title: string);
  minimize();
  maximize();
  close();
}
