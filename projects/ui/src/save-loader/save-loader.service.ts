import { NzMessageService } from 'ng-zorro-antd/message';
import { Injectable } from '@angular/core';

const minLoaderDuration = 1000;

@Injectable()
export class SaveLoaderService {
  constructor(
    private messageService: NzMessageService
  ) {
  }

  showLoader(): () => void {
    const messageId = this.messageService.loading('Saving').messageId;
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();

      if (endTime - startTime >= minLoaderDuration) {
        this._hideLoader(messageId);
      } else {
        setTimeout(() => {
          this._hideLoader(messageId);
        }, minLoaderDuration - (endTime - startTime));
      }
    };
  }

  private _hideLoader(messageId: string) {
    this.messageService.remove(messageId);
  }
}
