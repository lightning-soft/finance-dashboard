import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent extends FieldType {
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.field.fieldGroup, event.previousIndex, event.currentIndex);
  }
}
