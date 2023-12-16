import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplainerComponent } from './explainer.component';

describe('ExplainerComponent', () => {
  let component: ExplainerComponent;
  let fixture: ComponentFixture<ExplainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExplainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
