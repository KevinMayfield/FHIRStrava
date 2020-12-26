import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IhealthComponent } from './ihealth.component';

describe('IhealthComponent', () => {
  let component: IhealthComponent;
  let fixture: ComponentFixture<IhealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IhealthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IhealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
