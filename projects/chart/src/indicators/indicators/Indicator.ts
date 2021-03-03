declare const jQuery: any;

export abstract class Indicator {
  instance: any;
  name: string;
  config: any;
  settings: any;

  constructor(instance: any) {
    this.instance = instance;
    this.name = instance.constructor.className;

    this.settings = this._mapGetSettings(
      jQuery.extend(true, {}, instance.plots[0].settings)
    );
  }

  applySettings(settings: any) {
    this.instance.plots[0].settings = this._mapSetSettings(
      jQuery.extend(true, {}, settings)
    );
  }

  protected _mapGetSettings(settings: any): any {
    return settings;
  }

  protected _mapSetSettings(settings: any): any {
    return settings;
  }
}
