import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IContextMenuItem {
  title: string;
  action(): void;
}

export interface IContextMenuList {
  event: MouseEvent;
  list: IContextMenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  public contextMenuSubject = new Subject<IContextMenuList>();

  constructor() { }

  public showMenu(contextMenuList: IContextMenuList): void {
    this.contextMenuSubject.next(contextMenuList);
  }

}
