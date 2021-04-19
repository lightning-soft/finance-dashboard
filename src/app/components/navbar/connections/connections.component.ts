import { Component, ElementRef, Injector, Input, NgModuleRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { ItemsComponent } from 'base-components';
import { LayoutComponent } from 'layout';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { filter, skip } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';

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
export class ConnectionsComponent extends ItemsComponent<IConnection, any> {
  @Input() layout: LayoutComponent;

  @ViewChild('connectionsList') connectionsList: ElementRef<HTMLUListElement>;

  isLoading: { [key: number]: boolean } = {};
  activeConnection: IConnection;
  contextMenuConnection: IConnection;
  isConnectionsDropdownOpened = false;
  connectionsListHeight: number;

  protected _clearOnDisconnect = false;

  get favourites() {
    return this.items.filter(item => item.favourite);
  }

  get hasFavourites() {
    return this.favourites.length;
  }

  constructor(
    protected _injector: Injector,
    protected _repository: ConnectionsRepository,
    protected _accountsManager: AccountsManager,
    private nzContextMenuService: NzContextMenuService,
  ) {
    super();
    this.builder.setParams({
      filter: (connection: IConnection) => connection.favourite,
    });
    this._accountsManager.connections
      .pipe(
        filter(res => !!res),
        untilDestroyed(this),
      )
      .subscribe((connections) => {
          const value = connections.filter(item => item.favourite);
          this.builder.replaceItems(value);
        }
      );
  }

  loadData(params?: any) {
  }

  protected _handleConnection(connection: IConnection) {
    // super._handleConnection(connection);
    this.activeConnection = connection;
  }

  openAccounts(selectedItem: IConnection = null) {
    this.layout.addComponent({
      component: {
        name: 'accounts',
        state: { selectedItem }
      },
      ...accountsOptions
    });
  }

  connectionContextMenu(event: MouseEvent, menu: NzDropdownMenuComponent, connection: IConnection) {
    this.nzContextMenuService.create(event, menu);

    this.contextMenuConnection = connection;
  }

  connect() {
    if (!this.contextMenuConnection.password) {
      this.openAccounts(this.contextMenuConnection);
      return;
    }
    this.isLoading[this.contextMenuConnection.id] = true;
    this._accountsManager.connect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        (item) => {
          if (!item.error) {
            this.activeConnection = item;
            this.activeConnection.connected = true;
          } else {
            this.contextMenuConnection.error = item.error;
          }
        },
        err => this._notifier.showError(err),
        () => {
          delete this.isLoading[this.contextMenuConnection.id];
        },
      );
  }

  disconnect() {
    this.isLoading[this.contextMenuConnection.id] = true;
    this._accountsManager.disconnect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.contextMenuConnection.connected = false;
          this.activeConnection = null;
        },
        err => this._notifier.showError(err),
        () => {
          delete this.isLoading[this.contextMenuConnection.id];
        }
      );
  }

  removeFromFavourites() {
    this._accountsManager.toggleFavourite(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
        },
        err => console.error(err),
      );
  }

  handleDropdownToggle(opened: boolean): void {
    this.isConnectionsDropdownOpened = opened;
    if (opened) {
      setTimeout(() => this._setConnectionsListHeight());
    }
  }

  private _setConnectionsListHeight(): void {
    const maxHeight = 320;
    const connectionsOffsetHeight = this.connectionsList.nativeElement.offsetHeight;
    this.connectionsListHeight = connectionsOffsetHeight > maxHeight ? maxHeight : connectionsOffsetHeight;
  }
}
