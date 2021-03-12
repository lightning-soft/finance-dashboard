import { Executor } from 'global-handler';
import { EVENTS } from './enums';
import { Bounds, Options, saveData } from './types';
import { ILayoutNode } from "layout";

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
  height: number;
  width: number;
  active: boolean;
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

  on(event: EVENTS, fn: Executor): void;
  setTitle(title: string);
  minimize();
  maximize();
  close();
  focus();
  blur();
  emit(name: string, event);
}
