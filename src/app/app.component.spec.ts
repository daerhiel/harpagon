import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TitleStrategy } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';

import { LayoutService } from '@layout/layout.service';
import { TitleStrategyService } from './layout/title-strategy.service';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

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
        MatSnackBarModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabledBlocking' }),
        AppComponent
      ],
      providers: [
        { provide: TitleStrategy, useClass: TitleStrategyService }
      ]
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
});
