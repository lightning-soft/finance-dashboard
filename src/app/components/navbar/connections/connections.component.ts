import { AfterContentChecked, Component, ElementRef, HostListener, Injector, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { LayoutComponent } from 'layout';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { ConnectionsRepository, IConnection } from 'trading';
import { DomHelper, ItemsComponent } from 'base-components';

const { isContainerFitsElements } = DomHelper;

@UntilDestroy()
@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent extends ItemsComponent<IConnection, any> implements AfterContentChecked {
  @ViewChild('connectionsContainer') connectionsContainer: ElementRef;

  layout: LayoutComponent = (window as any).LayoutComponent;

  activeConnection: IConnection;
  contextMenuConnection: IConnection;

  groupConnectionsIntoDropdown: boolean;

  protected _clearOnDisconnect = false;

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
  }

  ngAfterContentChecked() {
    this.setGroupConnectionsIntoDropdown();
  }

  protected _handleConnection(connection: IConnection) {
    this.activeConnection = connection;

    this.setGroupConnectionsIntoDropdown();
  }

  @HostListener('window:resize')
  setGroupConnectionsIntoDropdown() {
    const container = this.connectionsContainer;

    this.groupConnectionsIntoDropdown = container && !isContainerFitsElements(container.nativeElement);
  }

  openAccounts(connection: IConnection = null) {
    this.layout.addComponent({
      component: {
        name: 'accounts',
      },
      resizable: false,
      height: 665,
      width: 600,
      maximizeBtn: false,
    });
  }

  connectionContextMenu(event: MouseEvent, menu: NzDropdownMenuComponent, connection: IConnection) {
    this.nzContextMenuService.create(event, menu);

    this.contextMenuConnection = connection;
  }

  connect() {
    this._accountsManager.connect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {},
        err => console.error(err),
      );
  }

  disconnect() {
    this._accountsManager.disconnect(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {},
        err => console.log(err),
      );
  }

  removeFromFavourites() {
    this._accountsManager.toggleFavourite(this.contextMenuConnection)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {},
        err => console.error(err),
      );
  }
}
