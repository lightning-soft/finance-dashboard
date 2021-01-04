import { DOCUMENT } from "@angular/common";
import { Injectable, Renderer2, Inject } from '@angular/core';
// @ts-ignore
import * as css from './dom.colors.css'

@Injectable()
export class CssApplier {
  private style: any;
  private appliedParams: any;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) {
  }

  // apply(obj: any) {
  //   if (!obj || this.appliedParams == obj)
  //     return;

  //   let result = css?.default?.toString();

  //   for (const key in obj) {
  //     result = result.replace(key, obj[key]);
  //   }

  //   this.setStyle(result);
  // }

  setStyle(style: string) {
    if (!this.style) {
      this.style = this.document.createElement('STYLE') as HTMLStyleElement;
      this.renderer.appendChild(this.document.head, this.style);
    }

    this.style.innerHTML = style;
  }
}
