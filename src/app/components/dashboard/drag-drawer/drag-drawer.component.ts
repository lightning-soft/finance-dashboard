import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { bottomWidgetList, widgetList } from '../component-options';
import { IBaseTemplate, TemplatesService } from 'templates';
import { NzModalService, NzSubMenuComponent } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { Components } from 'src/app/modules';
import { ConfirmModalComponent, RenameModalComponent } from 'ui';
import { getAccountInfoOptions } from '../../navbar/account/account.component';
import { Storage } from 'storage';


@UntilDestroy()
@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements OnDestroy, AfterViewInit {
  @Input() layout: LayoutComponent;
  @Output() handleToggleDropdown = new EventEmitter<boolean>();
  @ViewChild(NzSubMenuComponent) submenu: NzSubMenuComponent;

  opened = false;
  items = widgetList.filter(item => !item.hasTemplates);
  itemsWithPresets = widgetList.filter(item => item.hasTemplates);
  bottomItems = bottomWidgetList;
  templates: { [component: string]: IBaseTemplate[] } = {};
  readonly components = Components;
  private _templatesSubscription: Subscription;

  constructor(
    private _templatesService: TemplatesService,
    private _modalService: NzModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _zone: NgZone,
    private _storage: Storage,
  ) {
    this._templatesSubscription = this._templatesService.subscribe((data) => {
      this.templates = {};
      (data?.items || []).forEach(template => {
        this.templates[template.type] = this.templates.hasOwnProperty(template.type) ?
          [...this.templates[template.type], template] : [template];
      });
    });
    this.items = [...this.items, {
      icon: 'icon-account-info',
      name: 'Account Info',
      component: Components.AccountInfo,
      get options() {
        return getAccountInfoOptions(_storage);
      }
    }] as any;
  }

  ngAfterViewInit() {
    runZoneWhenSubmenuToggle(this.submenu, this._zone);
  }

  create(item, template?: IBaseTemplate): void {
    this.layout.addComponent({
      component: {
        name: item.component,
        template
      },
      ...item.options
    });
  }

  handleDropdownToggle(opened: boolean): void {
    this.opened = opened;
    this.handleToggleDropdown.emit(opened);
  }

  editChartTemplate(template: IBaseTemplate, event: MouseEvent): void {
    event.stopPropagation();

    const modal = this._modalService.create({
      nzWidth: 440,
      nzTitle: 'Edit name',
      nzContent: RenameModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        name: template.name,
        label: 'Template name'
      },
    });

    modal.afterClose.subscribe(name => {
      if (!name)
        return;

      this._templatesService.updateItem({ ...template, name }).subscribe();
    });
  }

  deleteChartTemplate(template: IBaseTemplate, event: MouseEvent): void {
    event.stopPropagation();

    const modal = this._modalService.create({
      nzTitle: 'Delete window',
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        message: `Do you want to delete "${template.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result?.confirmed)
        this._templatesService.deleteItem(template.id).subscribe();
    });
  }

  handleSubmenuOpenChange(): void {
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this._templatesSubscription.unsubscribe();
  }
}

// The problem which we are fixed here
// Sub menu not opened in correct place
// It is happened after we disable mouse events in zone
// Other solutions: modified library or create own menu component
// If it happens in other components(places) think about return some event in zone detection
function runZoneWhenSubmenuToggle(submenu: NzSubMenuComponent, zone: NgZone) {
  const originalSetMouseEnterState = submenu.setMouseEnterState.bind(submenu);
  submenu.setMouseEnterState = (...args) => {
    zone.run(() => originalSetMouseEnterState(...args));
  };
}
