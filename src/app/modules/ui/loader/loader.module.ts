import {NgModule} from '@angular/core';
import {LoaderComponent} from './loader.component';
import {NzIconModule} from 'ng-zorro-antd';
import { LoadingOutline } from '@ant-design/icons-angular/icons';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  exports: [
    LoaderComponent
  ],
  imports: [
    NzIconModule.forRoot([LoadingOutline])
  ],
  entryComponents: [
    LoaderComponent
  ]
})
export class LoaderModule {

}
