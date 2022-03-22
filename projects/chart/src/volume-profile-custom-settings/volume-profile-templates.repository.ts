import { Injectable, OnDestroy } from '@angular/core';
import { FakeRepository } from 'communication';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SettingsService } from 'settings';
import { KeyBinding } from 'keyboard';
import { WindowPopupManager } from 'layout';
import { WindowMessengerService } from 'window-messenger';

export interface IVolumeTemplate {
  id: string;
  name: string;
  settings: any;
  isUntemplated?: boolean;
  instance?: any;
}

const STORE_KEY = 'volumeProfileTemplates';
const DefaultTemplates = [
  {
    id: 'buyVolProf',
    name: 'Buy Vol Prof',
    isDefault: true,
    settings: {
      eth: {
        lines: {
          current: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
          dev: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
          prev: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
        },
        profile: {
          color: { type: 'profileColor', value: '#33BBFF' },
          extendNaked: {
            enabled: false, type: 'closesHighsLows', strokeTheme: {
              lineStyle: 'solid',
              strokeColor: '#33BBFF'
            }
          },
          extendNakedPocs: false,
          type: 'solidgram',
          vaInsideOpacity: 1,
          vaOutsideOpacity: 0.5,
          widthCorrelation: 0.5,
        },
        workingTimes: [
          {
            endDay: 0,
            endTime: 86399000,
            startDay: 0,
            startTime: 0,
          },
          {
            endDay: 1,
            endTime: 86399000,
            startDay: 1,
            startTime: 0,
          },
          {
            endDay: 2,
            endTime: 86399000,
            startDay: 2,
            startTime: 0,
          },
          {
            endDay: 3,
            endTime: 86399000,
            startDay: 3,
            startTime: 0,
          },
          {
            endDay: 4,
            endTime: 86399000,
            startDay: 4,
            startTime: 0,
          },
          {
            endDay: 5,
            endTime: 86399000,
            startDay: 5,
            startTime: 0,
          },
          {
            endDay: 6,
            endTime: 86399000,
            startDay: 6,
            startTime: 0,
          }
        ],
      },
      general: {
        align: 'right',
        calculateXProfiles: 999,
        customTickSize: { enabled: false, value: 5 },
        drawVPC: {
          parts: [
            { keyCode: 17 },
            { keyCode: 66 }
          ]
        },
        hide: { enabled: false, value: 'lastProfile' },
        margin: { value: 4, unit: 'pixel' },
        period: { type: 'every', value: 2, unit: 'week', date: null },
        smoothed: { enabled: false, value: 9 },
        type: 'buyVolume',
        vaCorrelation: 0.7,
        width: { value: 70, unit: 'pixel' },
        sessions: {
          current: {
            enabled: true,
            width: {
              unit: 'pixel',
              value: 70,
            }
          },
          days: {
            count: 10,
            enabled: true,
            includeCurrentSession: false,
            width: {
              unit: 'pixel',
              value: 70,
            }
          },
          prev: {
            enabled: true,
            width: {
              unit: 'pixel',
              value: 70
            }
          },
        },
      },
      graphics: {
        showPrices: true,
        summaryEnabled: true,
        summaryFont: {
          fillColor: '#33BBFF',
          fontFamily: 'Open Sans',
          fontSize: 12,
          fontWeight: '400',
        }
      },
      highlight: {
        poc: { enabled: true, value: '#33BBFF' },
        va: { enabled: true, value: '#33BBFF' },
      },
      splitProfile: false,
      profile: {
        color: { type: 'profileColor', value: '#A0A0A0' },
        extendNaked: {
          enabled: false, type: 'closesHighsLows', strokeTheme: {
            lineStyle: 'solid',
            strokeColor: '#33BBFF',
            width: 1,
          }
        },
        extendNakedPocs: false,
        profileColor: 'rgb(246,142,142,1)',
        type: 'solidgram',
        vaInsideOpacity: 1,
        vaOutsideOpacity: 0.5,
        widthCorrelation: 0.5,

      },
      overlayEthOverRth: false,
      lines: {
        current: {
          poc: {
            enabled: true,
            labelEnabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          },
          va: {
            enabled: true,
            labelEnabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
        dev: {
          poc: {
            enabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          },
          va: {
            enabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
        prev: {
          poc: {
            enabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          }, va: {
            enabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
      },
      workingTimes: [
        {
          endDay: 0,
          endTime: 86399000,
          startDay: 0,
          startTime: 0,
        },
        {
          endDay: 1,
          endTime: 86399000,
          startDay: 1,
          startTime: 0,
        },
        {
          endDay: 2,
          endTime: 86399000,
          startDay: 2,
          startTime: 0,
        },
        {
          endDay: 3,
          endTime: 86399000,
          startDay: 3,
          startTime: 0,
        },
        {
          endDay: 4,
          endTime: 86399000,
          startDay: 4,
          startTime: 0,
        },
        {
          endDay: 5,
          endTime: 86399000,
          startDay: 5,
          startTime: 0,
        },
        {
          endDay: 6,
          endTime: 86399000,
          startDay: 6,
          startTime: 0,
        }
      ],

    }
  },
  {
    id: 'sellVolProf',
    name: 'Sell Vol Prof',
    isDefault: true,
    settings: {
      eth: {
        lines: {
          current: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
          dev: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
          prev: {
            poc: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'green',
              },
            },
            va: {
              enabled: true,
              labelEnabled: false,
              strokeTheme: {
                lineStyle: 'solid',
                strokeColor: 'red',
                width: 1,
              }
            },
          },
        },
        profile: {
          color: { type: 'profileColor', value: '#33BBFF' },
          extendNaked: {
            enabled: false, type: 'closesHighsLows', strokeTheme: {
              lineStyle: 'solid',
              strokeColor: '#33BBFF'
            }
          },
          extendNakedPocs: false,
          type: 'solidgram',
          vaInsideOpacity: 1,
          vaOutsideOpacity: 0.5,
          widthCorrelation: 0.5,
        },
        workingTimes: [
          {
            endDay: 0,
            endTime: 86399000,
            startDay: 0,
            startTime: 0,
          },
          {
            endDay: 1,
            endTime: 86399000,
            startDay: 1,
            startTime: 0,
          },
          {
            endDay: 2,
            endTime: 86399000,
            startDay: 2,
            startTime: 0,
          },
          {
            endDay: 3,
            endTime: 86399000,
            startDay: 3,
            startTime: 0,
          },
          {
            endDay: 4,
            endTime: 86399000,
            startDay: 4,
            startTime: 0,
          },
          {
            endDay: 5,
            endTime: 86399000,
            startDay: 5,
            startTime: 0,
          },
          {
            endDay: 6,
            endTime: 86399000,
            startDay: 6,
            startTime: 0,
          }
        ],
      },
      general: {
        align: 'right',
        calculateXProfiles: 999,
        customTickSize: { enabled: false, value: 5 },
        drawVPC: {
          parts: [
            { keyCode: 17 },
            { keyCode: 83 }
          ]
        },
        hide: { enabled: false, value: 'lastProfile' },
        margin: { value: 4, unit: 'pixel' },
        period: { type: 'every', value: 2, unit: 'week', date: null },
        smoothed: { enabled: false, value: 9 },
        type: 'sellVolume',
        vaCorrelation: 0.7,
        width: { value: 70, unit: 'pixel' },
        sessions: {
          current: {
            enabled: true,
            width: {
              unit: 'pixel',
              value: 70,
            }
          },
          days: {
            count: 10,
            enabled: true,
            includeCurrentSession: false,
            width: {
              unit: 'pixel',
              value: 70,
            }
          },
          prev: {
            enabled: true,
            width: {
              unit: 'pixel',
              value: 70
            }
          },
        },
      },
      graphics: {
        showPrices: true,
        summaryEnabled: true,
        summaryFont: {
          fillColor: '#33BBFF',
          fontFamily: 'Open Sans',
          fontSize: 12,
          fontWeight: '400',
        }
      },
      highlight: {
        poc: { enabled: true, value: '#33BBFF' },
        va: { enabled: true, value: '#33BBFF' },
      },
      splitProfile: false,
      profile: {
        color: { type: 'profileColor', value: '#A0A0A0' },
        extendNaked: {
          enabled: false, type: 'closesHighsLows', strokeTheme: {
            lineStyle: 'solid',
            strokeColor: '#33BBFF',
            width: 1,
          }
        },
        extendNakedPocs: false,
        profileColor: 'rgb(246,142,142,1)',
        type: 'solidgram',
        vaInsideOpacity: 1,
        vaOutsideOpacity: 0.5,
        widthCorrelation: 0.5,

      },
      overlayEthOverRth: false,
      lines: {
        current: {
          poc: {
            enabled: true,
            labelEnabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          },
          va: {
            enabled: true,
            labelEnabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
        dev: {
          poc: {
            enabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          },
          va: {
            enabled: true,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
        prev: {
          poc: {
            enabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'green',
              width: 1,
            }
          }, va: {
            enabled: false,
            strokeTheme: {
              lineStyle: 'solid',
              strokeColor: 'red',
              width: 1,
            }
          }
        },
      },
      workingTimes: [
        {
          endDay: 0,
          endTime: 86399000,
          startDay: 0,
          startTime: 0,
        },
        {
          endDay: 1,
          endTime: 86399000,
          startDay: 1,
          startTime: 0,
        },
        {
          endDay: 2,
          endTime: 86399000,
          startDay: 2,
          startTime: 0,
        },
        {
          endDay: 3,
          endTime: 86399000,
          startDay: 3,
          startTime: 0,
        },
        {
          endDay: 4,
          endTime: 86399000,
          startDay: 4,
          startTime: 0,
        },
        {
          endDay: 5,
          endTime: 86399000,
          startDay: 5,
          startTime: 0,
        },
        {
          endDay: 6,
          endTime: 86399000,
          startDay: 6,
          startTime: 0,
        }
      ],

    }
  }
];

const saveTemplatesCommand = 'saveTemplatesCommand';
const applyTemplatesCommand = 'applyTemplatesCommand';

@Injectable({ providedIn: 'root' })
export class VolumeProfileTemplatesRepository extends FakeRepository<IVolumeTemplate> implements OnDestroy {
  private _subscriptions: Subscription;
  private _inited;
  updateAll$ = new Subject<IVolumeTemplate[]>();

  _request: Promise<any>;

  constructor(
    private _settingsService: SettingsService,
    private _windowPopupManager: WindowPopupManager,
    private _windowMessengerService: WindowMessengerService,
  ) {
    super();
    this._sendCommand();
    this._subscriptions = this.actions.subscribe(() => this._save());
    this._windowMessengerService.subscribe(applyTemplatesCommand, (data) => {
      this._store = {};
      data.forEach((item) => {
        this._store[item.id] = item;
      });
      this.updateAll$.next(data);
    });
  }

  async validateHotkeyTemplate(template) {
    if (!template)
      return false;

    const { id, settings } = template;
    if (settings.general.drawVPC == null)
      return true;
    const settingsBinding = KeyBinding.fromDTO(settings.general.drawVPC);

    return Object.values(this._store).every((value) => {
      if (id !== value.id && value.settings.general.drawVPC != null) {
        return !settingsBinding.equals(KeyBinding.fromDTO(value.settings.general.drawVPC));
      }
      return true;
    });
  }

  protected async _init(): Promise<void> {
    if (this._inited !== undefined)
      return this._request;

    this._inited = null;
    this._request = new Promise((resolve, reject) => {
      setTimeout(() => {
        super._init()
          .then(data => {
            resolve(data);
            this._inited = true;
          })
          .catch(e => {
            reject(e);
            this._inited = undefined;
          });
      });
    });
    return this._request;
  }

  private _sendCommand() {
    this._windowMessengerService.subscribe(saveTemplatesCommand, (data) => {
      this._store = {};
      data.forEach((item) => {
        this._store[item.id] = item;
      });
      this._save();
      this.updateAll$.next(data);
    });
  }

  private _getTemplates(): Observable<IVolumeTemplate[]> {
   return of(this.getTemplates());
  }

  getTemplates(): IVolumeTemplate[]{
    const keys = Object.keys(this._store);
    if (keys.length > 0) {
      const items: IVolumeTemplate[] = [];
      for (const key of keys) {
        if (this.store.hasOwnProperty(key)) {
          items.push(this.store[key]);
        }
      }

      return items;
    } else {
      return DefaultTemplates;
    }
  }

  private _save() {
    this._getTemplates()
      .subscribe(
        items => {
          if (this._windowPopupManager.isWindowPopup()) {
            this._windowMessengerService.send(saveTemplatesCommand, items);
          } else {
            this._settingsService.set(STORE_KEY, items);
            this._windowPopupManager.sendCommandToSubwindows(applyTemplatesCommand, items);
          }
        },
        err => console.error('Templates saved error', err)
      );
  }

  async _getItems() {
    const templates = this._settingsService.settings.value.volumeProfileTemplates;
    if (templates?.length)
      return Promise.resolve(templates);
    else {
      this._settingsService.set(STORE_KEY, DefaultTemplates);
      return Promise.resolve(DefaultTemplates);
    }
  }

  getItems(params: any = {}): Observable<any> {
    return from(this._init()).pipe(mergeMap(() => super.getItems(params)));
  }

  ngOnDestroy(): void {
    if (!this._subscriptions)
      return;

    this._subscriptions.unsubscribe();
    this._subscriptions = null;
  }
}
