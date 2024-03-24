import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExplainerComponent } from './explainer.component';

function createDialogRef<T>(): MatDialogRef<T> {
  return jasmine.createSpyObj<MatDialogRef<T>>('MatDialogRef', { close: undefined });
}

describe('ExplainerComponent', () => {
  let component: ExplainerComponent;
  let fixture: ComponentFixture<ExplainerComponent>;
  let dialogRef: MatDialogRef<ExplainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplainerComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef = createDialogRef() },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExplainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
