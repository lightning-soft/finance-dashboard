import { Component, OnInit, ViewChild } from '@angular/core';
import { NzDropdownMenuComponent, NzContextMenuService } from 'ng-zorro-antd';
import { ContextMenuService, IContextMenuItem, IContextMenuInfo } from './context-menu.service';

@Component({
  selector: 'context-menu',
  templateUrl: './context-menu.component.html',
})
export class ContextMenuComponent implements OnInit {

  public items: IContextMenuItem[] = [];

  @ViewChild('menu', {static: false})
  private _menuTemplate: NzDropdownMenuComponent;

  constructor(
    private nzContextMenuService: NzContextMenuService,
    private contextMenuService: ContextMenuService
  ) { }

  ngOnInit(): void {
    this.contextMenuService.contextMenuSubject.subscribe({
      next: (v) => this.showContextMenu(v)
    });
  }

  showContextMenu(constextMenuList: IContextMenuInfo) {
    this.items = constextMenuList.list;
    this.nzContextMenuService.create(constextMenuList.event, this._menuTemplate);
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }

}

