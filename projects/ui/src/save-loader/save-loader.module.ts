import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveLoaderService } from './save-loader.service';
import { NzMessageModule } from 'ng-zorro-antd/message';

@NgModule({
  imports: [CommonModule,
    NzMessageModule,
  ],
  providers: [
    SaveLoaderService,
  ]
})
export class SaveLoaderModule {

}
