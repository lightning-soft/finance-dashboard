import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IContextMenuItem {
  title: string;
  action(): void;
}

export interface IContextMenuInfo {
  event: MouseEvent;
  list: IContextMenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  public contextMenuSubject = new Subject<IContextMenuInfo>();

  constructor() { }

  public showMenu(contextMenuList: IContextMenuInfo): void {
    this.contextMenuSubject.next(contextMenuList);
  }

}
