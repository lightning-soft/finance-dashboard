import { Component } from '@angular/core';
import {GoldenLayoutHandler} from '../../../layout/goldenLayout.handler';
import {NzModalRef} from 'ng-zorro-antd/modal/modal-ref';
import {NzModalService} from 'ng-zorro-antd';

@Component({
  selector: 'app-add-component',
  templateUrl: './add-component.component.html',
  styleUrls: ['./add-component.component.scss']
})
export class AddComponentComponent  {
  items = GoldenLayoutHandler.layoutItems;

  constructor(private layoutHandler: GoldenLayoutHandler,
              private modal: NzModalService) { }


  addComponent(item: string) {
    this.layoutHandler.create(item);
    this.modal.closeAll();
  }
}
