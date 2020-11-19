import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DynamicComponentConfig } from 'lazy-modules';
import { IContainer } from '../../layout.node';

@Component({
  selector: 'window-header',
  templateUrl: './window-header.component.html',
  styleUrls: ['./window-header.component.scss'],
})
export class WindowHeaderComponent implements OnInit {

  layoutNode: any;
  window: IContainer;
  title: string;

  @ViewChild('toolbar') toolbar: ElementRef;

  constructor(
    private _config: DynamicComponentConfig,
  ) {
    const { data } = this._config;

    this.layoutNode = data.layoutNode;
    this.window = this.layoutNode.layoutContainer;
    this.title = (this.window as any)?.winTitlebar.innerText;
  }

  ngOnInit() {
    this._setToolbar();
  }

  protected _setToolbar() {
    if (this.layoutNode.getToolbarComponent) {
      this.layoutNode.getToolbarComponent().then(domElement => {
        this.toolbar.nativeElement.appendChild(domElement);
      });
    }
  }
}
