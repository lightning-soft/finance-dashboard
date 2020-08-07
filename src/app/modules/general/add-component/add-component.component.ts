import { Component, OnInit } from '@angular/core';
import {GoldenLayoutHandler} from '../../../layout/goldenLayout.handler';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-component',
  templateUrl: './add-component.component.html',
  styleUrls: ['./add-component.component.scss']
})
export class AddComponentComponent  {
  items = GoldenLayoutHandler.layoutItems;

  constructor(private layoutHandler: GoldenLayoutHandler,
              public dialogRef: MatDialogRef<AddComponentComponent>) { }


  addComponent(item: string) {
    this.layoutHandler.create(item);
    this.dialogRef.close();

  }
}
