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
  type: string,
  width: number,
  height: number,
  minHeight: number,
  minWidth: number,
  title: string,
  closable: boolean,
  minimizable: boolean,
  movable: boolean,
  maximizable: boolean,
  resizable: boolean,
  allowPopup: boolean,
  closableIfPopup: boolean,
  styles: object,
  classNames: object,
  draggableClass: string,
  order: number,
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
