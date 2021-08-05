import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundSettingComponent } from './sound-setting.component';

describe('SoundSettingComponent', () => {
  let component: SoundSettingComponent;
  let fixture: ComponentFixture<SoundSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoundSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
