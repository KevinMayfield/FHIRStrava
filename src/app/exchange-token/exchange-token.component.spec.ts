import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTokenComponent } from './exchange-token.component';

describe('ExchangeTokenComponent', () => {
  let component: ExchangeTokenComponent;
  let fixture: ComponentFixture<ExchangeTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExchangeTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
