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
  /*  const value = Object.entries<any>(this.model).sort(([, a], [, b]) => a.order - b.order)
      .reduce(( result, [key, item], ) => {
        result[key] = item;
        return result;
      }, {});
    this.formControl.patchValue(value, { emitEvent: false });*/
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
