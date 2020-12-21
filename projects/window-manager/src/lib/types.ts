import { IWindow } from './interfaces';
import { Position } from './enums';

export type Executor = (win: IWindow) => void;

export type Bounds = {
  top: number,
  left: number,
  bottom: number,
  right: number
};

export type Options = {
  x: number | Position,
  y: number | Position,
  width: number,
  height: number,
  minHeight: string
  minWidth: string
  title: string
  closable: boolean
  minimizable: boolean
  movable: boolean
  maximizable: boolean
  resizable: boolean
  styles: object
  classNames: object,
  draggableClass: string
  order: number
  componentState: () => {name: string, state: any};
};

export type saveData = {
  data: {
    maximized: {
      left: any;
      top: any;
      width: any;
      height: any;
    };
    x: number;
    y: number;
    width: any;
    height: any;
    component: any;
  }
};
