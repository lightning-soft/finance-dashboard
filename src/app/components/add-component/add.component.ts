import { Component } from '@angular/core';
import {NzModalService} from 'ng-zorro-antd';
import {GoldenLayoutHandler} from '../../modules/layout/models/golden-layout-handler';

@Component({
  selector: 'app-add-component',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent  {
  items = [];

  constructor(private layoutHandler: GoldenLayoutHandler,
              private modal: NzModalService) { }


  addComponent(item: string) {
    this.layoutHandler.create(item);
    this.modal.closeAll();
  }
}
