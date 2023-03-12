import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Indicator } from '../../../../chart/src/indicators/indicators/Indicator'
export abstract class NotifierService {
  periodInterval: any;
  selectedIndicator: Indicator;
  priceStat: string;

  private customSubject = new Subject<any>();
  customObservable = this.customSubject.asObservable();
  protected _prepareErrorMessage(message, defaultMessage) {
    let _message = defaultMessage ?? 'Something wrong';
    let _title = 'Error';
    let additionalInfo = '';

    if (message instanceof HttpErrorResponse && message.error)
      message = message.error;

    if (isString(message))
      _message = message;
    else if (isString(message?.title)) {
      _message = message.title;
      if (message.errors)
        additionalInfo = Object.values(message?.errors).reduce((total, curr) => `${total}\n${curr}`, '') as string;
    }
    else if (isString(message?.message))
      _message = message.message;
    else if (isString(message?.error?.message))
      _message = message.error.message;
    else if (Array.isArray(message?.message))
      _message = message?.message
        .map(i => i.constraints)
        .reduce((acc, i) => [...acc, Object.keys(i).map(key => i[key])], [])
        .join(',');


    if (isString(message?.error))
      _title = message.error;
    return { _title, _message, additionalInfo };

  }

  abstract showSuccess(message: string);

  callComponentMethod(value:any) {
    this.customSubject.next(value);
  }

  abstract showError(message: any, defaultMessage?: string);
  public setDisabled(disabled: boolean,OnLoad:boolean) {
    const options = this.selectedIndicator?.config[0]?.fieldGroup[4]?.fieldGroup[2]?.fieldGroup[0]?.fieldGroup;
    options[0].templateOptions.disabled = disabled;
    options[1].templateOptions.disabled = disabled;
    options[1].templateOptions['tooltip'] = disabled == true ? 'Load more than 3 days of data' : '';

    if(disabled)
    {
      this.selectedIndicator.settings.general.sessions.days.enabled=false;
      this.callComponentMethod(this.selectedIndicator);
    }
    if(OnLoad)
   { this.selectedIndicator.settings.general.sessions.days.enabled=false;
    this.callComponentMethod(this.selectedIndicator);}
    this.selectedIndicator.applySettings(this.selectedIndicator.settings);
  }
}

function isString(value) {
  return typeof value === 'string';
}
