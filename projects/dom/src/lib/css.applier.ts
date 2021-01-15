import { DOCUMENT } from '@angular/common';
import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import * as merge from 'deepmerge';

@Injectable()
export class CssApplier {
  private style: any;
  private config: any;
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: any
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  apply(selector: string, config: any) {
    if (config == this.config)
      return;
    const css = getCss(config, selector);
    this._setStyle(css);
    this.config = config;
  }

  private _setStyle(css: string) {
    if (!this.style) {
      this.style = this.document.createElement('STYLE') as HTMLStyleElement;
      this.style.id = 'dom-settings';
      this.renderer.appendChild(this.document.head, this.style);
    }

    this.style.innerHTML = css ?? '';
  }
}


function flattenObject(obj, result = {}, key = '') {
  if (Array.isArray(obj)) {
    return obj.map(i => flattenObject(i, result, key)).reduce((acc, i) => merge(acc, i), {});
  }

  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    const newKey = `${key}${i}`.trim();

    const value = obj[i];

    if (Array.isArray(value)) {
      for (const item of value) {
        flattenObject(item, result, newKey);
      }
    } else if ((typeof value) == 'object') {
      for (var x in value) {
        if (!value.hasOwnProperty(x)) continue;

        if (typeof value[x] != 'object') {
          if (!result[newKey])
            result[newKey] = {};

          result[newKey] = { ...result[newKey], [x]: value[x] }
        } else {
          flattenObject(value[x], result, `${newKey}${x}`);
        }
      }
    } else {
      result[key] = { ...result[key], [i]: value }
    }
  }

  return result;
};

function getCss(json, selector) {
  json = flattenObject(json, {}, selector);
  const selectors = Object.keys(json);

  return selectors.map((selector) => {
    let definition = json[selector];
    const rules = Object.keys(definition)
    const result = rules.map((rule) => `${rule}:${definition[rule]}`).join(';')
    return `${selector}{${result}}`
  }).join('\n')
}
