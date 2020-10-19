import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSelectComponent } from './link-select.component';

describe('LinkSelectComponent', () => {
  let component: LinkSelectComponent;
  let fixture: ComponentFixture<LinkSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
