import {NgModule} from '@angular/core';
import {LoaderComponent} from './loader.component';
import {NzIconModule} from 'ng-zorro-antd';
import { LoadingOutline } from '@ant-design/icons-angular/icons';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  exports: [
    LoaderComponent
  ],
    imports: [
        NzIconModule.forRoot([LoadingOutline]),
        CommonModule
    ],
  entryComponents: [
    LoaderComponent
  ]
})
export class LoaderModule {

}
