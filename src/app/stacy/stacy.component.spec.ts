import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StacyComponent } from './stacy.component';

describe('StacyComponent', () => {
  let component: StacyComponent;
  let fixture: ComponentFixture<StacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StacyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
