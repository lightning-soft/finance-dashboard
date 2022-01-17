import { HttpErrorResponse } from '@angular/common/http';

export abstract class NotifierService {
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

  abstract showError(message: any, defaultMessage?: string);
}

function isString(value) {
  return typeof value === 'string';
}
