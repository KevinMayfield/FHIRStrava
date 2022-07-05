import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDocumentComponent } from './patient-document.component';

describe('PatientDocumentComponent', () => {
  let component: PatientDocumentComponent;
  let fixture: ComponentFixture<PatientDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
