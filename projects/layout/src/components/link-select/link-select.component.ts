import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DynamicComponentConfig } from 'lazy-modules';

@Component({
  selector: 'link-select',
  templateUrl: './link-select.component.html',
  styleUrls: ['./link-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LinkSelectComponent implements OnInit {
  labels = ['unlink', 'green', 'yellow', 'blue', 'pink'];
  value = 0;

  @Output() handleChange: EventEmitter<number> = new EventEmitter();

  private $linkSelectValue: any;

  constructor(
    public config: DynamicComponentConfig,
    private elementRef: ElementRef,
  ) {}

  ngOnInit() {
    if (this.config.data && this.config.data.value) {
      this.value = this.config.data.value;
    }

    setTimeout(() => {
      this.$linkSelectValue = $('<span class="link-select-value"></span>');

      this.$linkSelectValue.appendTo(
        $(this.elementRef.nativeElement).find('.ant-select-selection-item')
      );

      this.setLinkSelectedValue();
    });
  }

  _handleChange(value: number) {
    this.value = value;

    this.setLinkSelectedValue();

    this.handleChange.emit(this.value);
  }

  setLinkSelectedValue() {
    const className = `link-select-value ${
      this.value ? `text-${this.labels[this.value]}` : ''
    }`;

    this.$linkSelectValue
      .attr('class', className)
      .html(this.getIconHtml());
  }

  getIconHtml(): string {
    return `<i class="icon-${!this.value ? 'unlink' : 'link'}"></i>`;
  }
}
