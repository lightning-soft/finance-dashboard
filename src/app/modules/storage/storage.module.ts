import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalStorage } from './LocalStorage';
import { Storage } from './Storage';
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
