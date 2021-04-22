import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from './network.service';


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NetworkService
  ]
})
export class NetworkModule {
}
