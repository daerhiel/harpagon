import { toObservable } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { LayoutService, SIDENAV_OPEN_PROPERTY_NAME } from './layout.service';

describe('LayoutService', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    }).compileComponents();
    localStorage.removeItem(SIDENAV_OPEN_PROPERTY_NAME);
  });

  it('should create', () => {
    const service = TestBed.inject(LayoutService);

    expect(service).toBeTruthy();
  });

  it('should default sidenav to closed', () => {
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeFalse();
  });

  it('should read sidenav open', () => {
    localStorage.setItem(SIDENAV_OPEN_PROPERTY_NAME, JSON.stringify(true));
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeTrue();
  });

  it('should read sidenav closed', () => {
    localStorage.setItem(SIDENAV_OPEN_PROPERTY_NAME, JSON.stringify(false));
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeFalse();
  });

  it('should toggle sidenav open', async () => {
    localStorage.setItem(SIDENAV_OPEN_PROPERTY_NAME, JSON.stringify(false));
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeFalse();

    service.toggleSidenav();

    expect(service.isSidenavOpen()).toBeTrue();
    expect(JSON.parse(localStorage.getItem(SIDENAV_OPEN_PROPERTY_NAME) ?? 'false')).toBeTrue();
  });

  it('should toggle sidenav close', async () => {
    localStorage.setItem(SIDENAV_OPEN_PROPERTY_NAME, JSON.stringify(true));
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeTrue();

    service.toggleSidenav();

    expect(service.isSidenavOpen()).toBeFalse();
    expect(JSON.parse(localStorage.getItem(SIDENAV_OPEN_PROPERTY_NAME) ?? 'false')).toBeFalse();
  });

  it('should set sidenav open', async () => {
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeFalse();

    service.toggleSidenav(true);

    expect(service.isSidenavOpen()).toBeTrue();
    expect(JSON.parse(localStorage.getItem(SIDENAV_OPEN_PROPERTY_NAME) ?? 'false')).toBeTrue();
  });

  it('should set sidenav close', async () => {
    const service = TestBed.inject(LayoutService);

    expect(service.isSidenavOpen()).toBeFalse();

    service.toggleSidenav(false);

    expect(service.isSidenavOpen()).toBeFalse();
    expect(JSON.parse(localStorage.getItem(SIDENAV_OPEN_PROPERTY_NAME) ?? 'false')).toBeFalse();
  });
});
