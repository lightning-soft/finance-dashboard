import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ArrayHelper } from 'projects/base-components/src/helpers';

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
    ArrayHelper.shiftItems(this.field.fieldGroup, event.previousIndex, event.currentIndex);
    this.field.fieldGroup.forEach((item, index) => {
      this.model[item.key as string].order = index;
    });
    this.form.patchValue(this.model);
  }
}
