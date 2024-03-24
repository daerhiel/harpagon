import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { SettingsComponent } from './settings.component';

function createDialogRef<T>(): MatDialogRef<T> {
  return jasmine.createSpyObj<MatDialogRef<T>>('MatDialogRef', { close: undefined });
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let dialogRef: MatDialogRef<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SettingsComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef = createDialogRef() },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
