declare const jQuery: any;

export abstract class Indicator {
  instance: any;
  name: string;
  config: any;
  settings: any;

  get indicatorSettings(): any {
    return this.instance.settings || this.instance.plots[0].settings;
  }

  set indicatorSettings(settings: any) {
    if (this.instance.settings) {
      this.instance.settings = settings;
    } else {
      this.instance.plots[0].settings = settings;
    }
  }

  constructor(instance: any) {
    this.instance = instance;
    this.name = instance.constructor.className;

    const _settings = this._mapGetSettings(
      jQuery.extend(true, {}, this.indicatorSettings)
    );

    console.log('get', _settings);

    this.settings = _settings;
  }

  applySettings(settings: any) {
    const _settings = this._mapSetSettings(
      jQuery.extend(true, {}, settings)
    );

    console.log('set', _settings);

    this.indicatorSettings = _settings;
  }

  protected _mapGetSettings(settings: any): any {
    return settings;
  }

  protected _mapSetSettings(settings: any): any {
    return settings;
  }
}
