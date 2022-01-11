import { EVENTS } from './enums';
import { Bounds, Options, saveData } from './types';
import { ILayoutNode } from 'layout';

export interface IWindowManager {
  container: HTMLElement;
  windows: IWindow[];
  activeWindow: IWindow;
  bounds: Bounds;

  createWindow(option: object): IWindow;
  load(config);
  save(): saveData[];
  updateGlobalOffset(): void;
  setCustomBounds(bounds: Bounds): void;
}

export interface IWindow {
  id: number;
  x: number;
  y: number;
  z: number;
  height: number;
  width: number;
  minWidth: number;
  minHeight: number;
  active: boolean;
  visible: boolean;
  bounds: Bounds;
  type: any;
  ignoreOffset: number;
  globalOffset: {top: number, left: number}
  keepInside: boolean;
  maximized: boolean;
  minimized: boolean;
  options: Options;
  wm: IWindowManager;
  _container: HTMLElement;
  component: ILayoutNode;

  on(event: EVENTS, fn: (window: IWindow) => void): void;
  save(): saveData;
  setTitle(title: string);
  minimize();
  maximize();
  close();
  focus();
  blur();
  emit(name: string, event);
}
