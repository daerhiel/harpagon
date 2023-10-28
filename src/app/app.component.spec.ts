import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Title } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';

import { LayoutService } from '@layout/layout.service';
import { AppComponent } from './app.component';

export class AppComponentHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  getSnackBar = this.documentRootLocatorFactory().locatorFor(MatSnackBarHarness);
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let harness: AppComponentHarness;

  beforeEach(async () => {
    document.body.classList.add('mat-typography');

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        MatSnackBarModule,
        AppComponent
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppComponentHarness);
  });

  it('should create the app', () => {
    expect(component).not.toBeNull();
  });

  it('should reference layout', () => {
    expect(component.layout).toBeInstanceOf(LayoutService);
  });

  it(`should have the 'harpagon' title`, inject([Title], async (title: Title) => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(title.getTitle()).toEqual('Harpagon - Home');
  }));
});
