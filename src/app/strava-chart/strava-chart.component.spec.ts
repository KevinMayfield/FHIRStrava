import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StravaChartComponent } from './strava-chart.component';

describe('StravaChartComponent', () => {
  let component: StravaChartComponent;
  let fixture: ComponentFixture<StravaChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StravaChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StravaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
