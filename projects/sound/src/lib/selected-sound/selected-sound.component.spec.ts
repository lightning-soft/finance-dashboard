import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedSoundComponent } from './selected-sound.component';

describe('SelectedSoundComponent', () => {
  let component: SelectedSoundComponent;
  let fixture: ComponentFixture<SelectedSoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedSoundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedSoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
