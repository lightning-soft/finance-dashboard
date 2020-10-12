import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalStorage } from './local.storage';
import { Storage } from './storage';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: Storage,
      useClass: LocalStorage
    }
  ],
  exports: []
})
export class StorageModule {
}
