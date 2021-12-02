import { ExcludeId } from 'communication';
import { CreateModalComponent } from 'ui';
import { NotifierService } from 'notifier';
import { TemplatesService } from 'templates';
import { NzModalService } from 'ng-zorro-antd';
import { MixinHelper } from 'base-components';
import { IBaseTemplate } from './models';
import { Component } from '@angular/core';
import { saveData } from 'window-manager';
import { Components } from 'src/app/modules';

const { mixinDecorator } = MixinHelper;

export interface IPresets<T> {
    loadedPresets: IBaseTemplate<T>;
    _modalService: NzModalService;
    _templatesService: TemplatesService;
    _notifier: NotifierService;
    loadState(state: T);
    saveState(): T;
    getTabState?: () => saveData;
    loadTemplate(presets: IBaseTemplate<T>): void;
    ngAfterViewInit(): void;
    savePresets(presets: IBaseTemplate<T>): void;
    createPresets(type: Components): void;
}

export interface _Presets<T> extends IPresets<T> {

}

@Component({
    template: ''
  })
export abstract class _Presets<T> implements IPresets<T> {
    loadedPresets: IBaseTemplate<T>;
    _modalService: NzModalService;
    _templatesService: TemplatesService;
    _notifier: NotifierService;

    abstract loadState(state: T): void;
    abstract saveState(): T;

    ngAfterViewInit(): void {
        this._templatesService.subscribe((data) => {
            if (this.loadedPresets) return;

            this.loadedPresets = data.items.find(i => this.loadedPresets?.id === i?.id);
        });
    }

    loadTemplate(presets: IBaseTemplate<T>): void {
        this.loadedPresets = presets;
        this.loadState(presets.state);
    }

    savePresets(presets: IBaseTemplate<T>): void {
        if (!this.loadedPresets) return;

        presets.state = this.saveState();
        presets.tabState = this.getTabState();

        this._templatesService.updateItem(presets).subscribe(
            () => {
                this.loadedPresets = presets;
            },
            (error) => this._notifier.showError(error, 'Failed to save Template')
        );
    }

    createPresets(type: Components): void {
        const modal = this._modalService.create({
            nzWidth: 440,
            nzTitle: 'Save as',
            nzContent: CreateModalComponent,
            nzWrapClassName: 'vertical-center-modal',
            nzComponentParams: {
                name: 'Preset name',
            },
        });

        modal.afterClose.subscribe(result => {
            if (!result) return;

            const presets: ExcludeId<IBaseTemplate<T>> = {
                name: result.name,
                state: this.saveState(),
                tabState: this.getTabState(),
                type,
            };

            this._templatesService.createItem(presets).subscribe(
                (presets) => {
                    this.loadedPresets = presets;
                },
                (error) => this._notifier.showError(error, 'Failed to create Template')
            );
        });
    }
}

export function LayoutPresets() {
    return mixinDecorator(_Presets, ['ngAfterViewInit']);
}
