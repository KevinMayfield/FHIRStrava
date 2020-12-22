import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PWVChartComponent } from './pwvchart.component';

describe('PWVChartComponent', () => {
  let component: PWVChartComponent;
  let fixture: ComponentFixture<PWVChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PWVChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PWVChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
