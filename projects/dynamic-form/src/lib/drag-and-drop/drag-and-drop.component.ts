import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent extends FieldType {
  drop(event: CdkDragDrop<string[]>) {
    const firstField = this.field.fieldGroup[event.previousIndex];
    const secondField = this.field.fieldGroup[event.currentIndex];

    this.model[firstField.key as string].order = event.currentIndex;
    this.model[secondField.key as string].order = event.previousIndex;
    this.form.patchValue(this.model);

    moveItemInArray(this.field.fieldGroup, event.previousIndex, event.currentIndex);
  }
}
