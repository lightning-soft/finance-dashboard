declare const jQuery: any;

export abstract class Indicator {
  instance: any;
  name: string;
  config: any;
  settings: any;

  constructor(instance: any) {
    this.instance = instance;
    this.name = instance.constructor.className;

    const _settings = this._mapGetSettings(
      jQuery.extend(true, {}, instance.plots[0].settings)
    );

    console.log('get', _settings);

    this.settings = _settings;
  }

  applySettings(settings: any) {
    const _settings = this._mapSetSettings(
      jQuery.extend(true, {}, settings)
    );

    console.log('set', _settings);

    this.instance.plots[0].settings = _settings;
  }

  protected _mapGetSettings(settings: any): any {
    return settings;
  }

  protected _mapSetSettings(settings: any): any {
    return settings;
  }
}
