import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager, Connection } from 'accounts-manager';
import { ItemsComponent } from 'base-components';
import { LayoutComponent } from 'layout';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { ConnectionsRepository, IConnection } from 'trading';
import { isElectron } from '../../../is-electron';

export const accountsOptions = {
  resizable: false,
  height: 463,
  width: 502,
  minimizable: false,
  maximizable: false,
  allowPopup: false,
  single: true,
  removeIfExists: true,
  x: 'center',
  y: 'center',
};

@UntilDestroy()
@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent extends ItemsComponent<IConnection, any> implements OnInit, AfterViewInit {
  @Input() layout: LayoutComponent;
  @Output() handleToggleDropdown = new EventEmitter<boolean>();

  @ViewChild('connectionsList') connectionsList: ElementRef<HTMLUListElement>;

  hasConnectedConnections: boolean;
  contextMenuConnection: Connection;
  isConnectionsDropdownOpened = false;
  connectionsListHeight: number;

  protected _clearOnDisconnect = false;
  maxConnections = 2;

  private _items = [];

  get items() {
    return this._items;
  }

  constructor(
    protected _injector: Injector,
    protected _repository: ConnectionsRepository,
    protected _accountsManager: AccountsManager,
    private nzContextMenuService: NzContextMenuService,
    protected _cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this._cd.detach();
    this._accountsManager.connectionsChange
      .pipe(untilDestroyed(this))
      .subscribe(connections => {
        this.hasConnectedConnections = connections.some(item => item.connected);
        this._items = connections.filter(i => i.favorite);
        this._cd.detectChanges();
      });
  }
  ngAfterViewInit() {
    if (isElectron()) {
      this.maxConnections = 1;
    }
  }

  loadData(params?: any) {
  }

  openAccounts(selectedItem: IConnection = null, index = -1) {
    this.layout.addComponent({
      component: {
        name: 'accounts',
        state: { selectedItem, selectItemIndex: index }
      },
      ...accountsOptions
    });
  }

  connectionContextMenu(event: MouseEvent, menu: NzDropdownMenuComponent, connection: Connection) {
    this.nzContextMenuService.create(event, menu);

    this.contextMenuConnection = connection;
  }

  connect() {
    if (!this.contextMenuConnection.password) {
      this.openAccounts(this.contextMenuConnection);
      return;
    }
    this._accountsManager.connect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        (item) => { },
        err => console.error('Connect error', err),
      );
  }

  disconnect() {
    this._accountsManager.disconnect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.contextMenuConnection.connected = false;
        },
        err => console.error('Disconnect error', err),
      );
  }

  removeFromFavorites() {
    this.contextMenuConnection.toggleFavorite()
      .pipe(untilDestroyed(this))
      .subscribe(
        () => this._setConnectionsListHeight(),
        err => console.error(err),
      );
  }

  handleDropdownToggle(opened: boolean): void {
    this.isConnectionsDropdownOpened = opened;
    this.handleToggleDropdown.emit(opened);
    this._setConnectionsListHeight();
  }

  private _setConnectionsListHeight(): void {
    if (!this.isConnectionsDropdownOpened)
      return;

    const maxHeight = 330;

    setTimeout(() => {
      const connectionsOffsetHeight = this.connectionsList.nativeElement.offsetHeight;
      this.connectionsListHeight = connectionsOffsetHeight > maxHeight ? maxHeight : connectionsOffsetHeight;
    });
  }
}
