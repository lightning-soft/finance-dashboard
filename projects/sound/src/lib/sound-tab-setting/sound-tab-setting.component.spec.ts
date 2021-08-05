import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundTabSettingComponent } from './sound-tab-setting.component';

describe('SoundTabSettingComponent', () => {
  let component: SoundTabSettingComponent;
  let fixture: ComponentFixture<SoundTabSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoundTabSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundTabSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
