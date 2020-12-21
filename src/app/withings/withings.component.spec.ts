import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithingsComponent } from './withings.component';

describe('WithingsComponent', () => {
  let component: WithingsComponent;
  let fixture: ComponentFixture<WithingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WithingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WithingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
