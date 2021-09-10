import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class DragAndDropComponent extends FieldType implements OnInit {
  ngOnInit() {
    this.field.fieldGroup = this.field.fieldGroup.sort((a, b) =>
      a.model.order - b.model.order);
  }

  drop(event: CdkDragDrop<string[]>) {
    const firstField = this.field.fieldGroup[event.previousIndex];
    const secondField = this.field.fieldGroup[event.currentIndex];

    const temp = this.model[firstField.key as string].order;
    this.model[firstField.key as string].order = this.model[secondField.key as string].order;
    this.model[secondField.key as string].order = temp;
    this.form.patchValue(this.model);

    moveItemInArray(this.field.fieldGroup, event.previousIndex, event.currentIndex);
  }
}
