import { NgModule } from '@angular/core';
import { SearchSelectComponent } from './search-select/search-select.component';
import { NzSelectModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [SearchSelectComponent],
    imports: [
        NzSelectModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
  exports: [SearchSelectComponent]
})
export class SearchSelectModule { }
