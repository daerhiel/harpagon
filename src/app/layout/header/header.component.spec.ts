import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarHarness } from '@angular/material/toolbar/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconHarness } from '@angular/material/icon/testing';

import { TitleStrategyService } from '../title-strategy.service';
import { LayoutService } from '../layout.service';
import { HeaderComponent } from './header.component';

export class HeaderComponentHarness extends ComponentHarness {
  static hostSelector = 'app-header';

  getToolbar = this.locatorFor(MatToolbarHarness);
  getTitleButton = this.locatorFor(MatButtonHarness.with({ selector: '#title' }));
  getHomeButton = this.locatorFor(MatButtonHarness.with({ selector: '#menu' }));
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let harness: HeaderComponentHarness;

  beforeEach(async () => {
    document.body.classList.add('mat-typography');

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        HeaderComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, HeaderComponentHarness);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a toolbar', async () => {
    const toolbar = await harness.getToolbar();
    expect(toolbar).not.toBeNull();
  });

  it('should render home button with title', async () => {
    const titleButton = await harness.getTitleButton();
    expect(await titleButton.getText()).toEqual(TitleStrategyService.title);
  });

  it('should render menu button', async () => {
    const homeButton = await harness.getHomeButton();
    const icon = await homeButton.getHarness(MatIconHarness);
    expect(await icon.getName()).toEqual('menu');
  });

  it('should should toggle on sidenav', inject([LayoutService], async (layout: LayoutService) => {
    layout.toggleSidenav(false);

    const homeButton = await harness.getHomeButton();
    await homeButton.click();

    expect(layout.isSidenavOpen()).toBeTrue();
  }));

  it('should should toggle off sidenav', inject([LayoutService], async (layout: LayoutService) => {
    layout.toggleSidenav(true);

    const homeButton = await harness.getHomeButton();
    await homeButton.click();

    expect(layout.isSidenavOpen()).toBeFalse();
  }));
});
