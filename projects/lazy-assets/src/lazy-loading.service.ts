import { Inject, Injectable } from '@angular/core';

export interface IScript {
  src: string;
  charset?: string;
  type?: string;
}

export interface IStyle {
  href: string;
  rel?: string;
}

export interface ILoadingFiles {
  promise?: Promise<boolean> | boolean;
}

export interface ILoadingScript extends IScript, ILoadingFiles {
}

export interface ILoadingStyle extends IStyle, ILoadingFiles {
}

export class LazyLoadingServiceConfig {
  styles?: ILoadingStyle[];
  scripts?: ILoadingScript[];
}

declare let document: any;

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {

  private loadedScripts: ILoadingScript[] = [];
  private loadedStyles: ILoadingStyle[] = [];

  constructor(@Inject(LazyLoadingServiceConfig) private _config: LazyLoadingServiceConfig) {

  }

  async load() {
    const requests = [];
    const config = this._config;

    if (config.scripts)
      requests.push(this.loadScripts(config.scripts));

    if (config.styles)
      requests.push(this.loadStyles(config.styles));

    return Promise.all(requests);
  }

  async loadScripts(scriptsForLoading: IScript[]): Promise<boolean> {
    let flag = true;
    for (const script of scriptsForLoading) {
      if (false === await this.loadScript(script)) {
        flag = false;
      }
    }
    return Promise.resolve(flag);
  }

  async loadStyles(stylesForLoading: IStyle[]): Promise<boolean> {
    let flag = true;
    for (const style of stylesForLoading) {
      if (false === await this.loadStyle(style)) {
        flag = false;
      }
    }
    return Promise.resolve(flag);
  }

  loadScript(script: IScript): Promise<boolean> {
    const { loadedScripts } = this;
    let existingScript: ILoadingScript = loadedScripts.find((item: IScript) => item.src === script.src);

    if (!existingScript) {
      existingScript = script as any;
      loadedScripts.push(existingScript);
    }

    return this._loadFile(existingScript, () => {
      const scriptElement = document.createElement('script');
      return Object.assign(scriptElement, script);
    });
  }

  loadStyle(style: IStyle): Promise<boolean> {
    const { loadedStyles } = this;
    let existingStyle: ILoadingStyle = loadedStyles.find((item: IStyle) => item.href === style.href);

    if (!style.rel) {
      style.rel = 'stylesheet';
    }

    if (!existingStyle) {
      existingStyle = style as any;
      loadedStyles.push(existingStyle);
    }

    return this._loadFile(existingStyle, () => {
      const styleElement = document.createElement('link');
      return Object.assign(styleElement, style);
    });
  }

  private async _loadFile(file: ILoadingFiles, createElement: () => Document): Promise<boolean> {
    if (file.promise === true) {
      return Promise.resolve(true);
    }

    if (file.promise == null) {
      file.promise = new Promise((resolve, reject) => {
        const element = createElement();

        if (element.readyState) {  // IE
          element.onreadystatechange = () => {
            if ((element as any).readyState === 'loaded' || element.readyState === 'complete') {
              resolve(true);
            }
          };
        } else {  // Others
          element.onload = () => {
            resolve(true);
          };
        }

        element.onerror = reject;
        document.getElementsByTagName('head')[0].appendChild(element);
      });
    }

    (file.promise as Promise<boolean>)
      .then(value => file.promise = value);

    return file.promise as Promise<boolean>;
  }
}
