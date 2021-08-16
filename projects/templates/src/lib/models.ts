import { IBaseItem } from "communication";
import { saveData } from "window-manager";

export interface IBaseTemplate<T = any> extends IBaseItem {
  name: string;
  type: string;
  tabState?: saveData;
  state?: T;
}
