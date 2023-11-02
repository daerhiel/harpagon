import { Component, NgZone, computed } from '@angular/core';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterTestingModule } from '@angular/router/testing';

import { PortalComponent } from './portal.component';

@Component({ standalone: true })
class TestComponent {
}

const routes: Routes = [{
  path: 'parent', loadComponent: () => TestComponent, children: [
    { path: 'child', loadComponent: () => TestComponent }
  ]
}];

describe('PortalComponent', () => {
  let component: PortalComponent;
  let fixture: ComponentFixture<PortalComponent>;

  beforeEach(async () => {
    document.body.classList.add('mat-typography');

    await TestBed.configureTestingModule({
      imports: [TestComponent,
        MatProgressSpinnerModule,
        PortalComponent,
        RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabledBlocking' })]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should indicate loading parent route', inject([Router, NgZone], async (router: Router, ngZone: NgZone) => {
    let counter = 0;
    const transitions = computed(() => (component.isRouteLoading(), counter++));
    expect(transitions()).toBe(0);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent']);
    });

    expect(transitions()).toBe(1);
    expect(component.isRouteLoading()).toBeFalse();
  }));

  it('should indicate loading nested child route', inject([Router, NgZone], async (router: Router, ngZone: NgZone) => {
    let counter = 0;
    const transitions = computed(() => (component.isRouteLoading(), counter++));
    expect(transitions()).toBe(0);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent/child']);
    });

    expect(transitions()).toBe(1);
    expect(component.isRouteLoading()).toBeFalse();
  }));

  it('should indicate loading parent and then child route', inject([Router, NgZone], async (router: Router, ngZone: NgZone) => {
    let counter = 0;
    const transitions = computed(() => (component.isRouteLoading(), counter++));
    expect(transitions()).toBe(0);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent']);
    });

    expect(transitions()).toBe(1);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent/child']);
    });

    expect(transitions()).toBe(2);
    expect(component.isRouteLoading()).toBeFalse();
  }));

  it('should not indicate loading when back from child to parent', inject([Router, NgZone], async (router: Router, ngZone: NgZone) => {
    let counter = 0;
    const transitions = computed(() => (component.isRouteLoading(), counter++));
    expect(transitions()).toBe(0);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent/child']);
    });

    expect(transitions()).toBe(1);
    expect(component.isRouteLoading()).toBeFalse();

    await ngZone.run(async () => {
      await router.navigate(['parent']);
    });

    expect(transitions()).toBe(1);
    expect(component.isRouteLoading()).toBeFalse();
  }));
});
