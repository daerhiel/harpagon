import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NwIconDirective, cdnHosting, nativeHosting } from './nw-icon.directive';
import { IconRef } from './nw-db.module';

const iconRefs: IconRef[] = [
  { icon: 'icons/items/consumable/watert1' },
  { icon: 'icons/items/resource/matrix-weapont52' },
  { icon: 'icons/items/housingitem/house_housingitem_winter2023_woodenmobile' }
]

const iconShineRefs: IconRef[] = [
  { icon: 'LyShineUI/Images/Map/Icon/POIs/Shipwreck.png' },
  { icon: 'LyShineUI/Images/Map/Icon/POIs/abandoned_campsite.png' }
]

const iconNativeRefs: IconRef[] = [
  { icon: 'soon' },
  { icon: 'currency_azoth' },
]

const iconMissingRefs: IconRef[] = [
  {},
  { icon: '' },
]

const iconRarityRefs: IconRef[] = [
  { icon: 'test', rarity: 0 },
  { icon: 'test', rarity: 1 },
  { icon: 'test', rarity: 2 },
  { icon: 'test', rarity: 3 },
  { icon: 'test', rarity: 4 },
  { icon: 'test', rarity: 5 }
]

describe('NwIconDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render default image source', () => {
    const img = fixture.debugElement.query(By.css('img'));
    expect(img.nativeElement.src).toMatch(/soon.png$/i);
  });

  iconRefs.forEach((ref) => {
    it(`should render correct image source: ${ref.icon}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.src).toBe(`${cdnHosting}/${ref.icon}.png`);
    });
  });

  iconNativeRefs.forEach((ref) => {
    it(`should render correct native image source: ${ref.icon}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.src).toBe(`${nativeHosting}/${ref.icon}.png`);
    });
  });

  iconShineRefs.forEach((ref) => {
    it(`should render correct shineUI image source: ${ref.icon}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.src).toBe(`${cdnHosting}/${ref.icon}`
        .replace(/LyShineUI\/Images\//i, '').toLowerCase());
    });
  });

  iconMissingRefs.forEach((ref) => {
    it(`should render missing image source: ${ref.icon}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.src).toBe(`${nativeHosting}/soon.png`);
    });
  });

  it('should render no rarity on default', () => {
    const img = fixture.debugElement.query(By.css('img'));
    expect(Object.keys(img.classes).some(x => x.startsWith('item-tier-'))).toBeFalse();
  });

  iconRarityRefs.forEach((ref) => {
    it(`should render image rarity: ${ref.rarity}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.classList.contains(`item-tier-${ref.rarity}`)).toBeTrue();
    });
  });
});

@Component({
  selector: 'app-test',
  template: '<img [nwIcon]="icon"/>',
  standalone: true,
  imports: [NwIconDirective]
})
class TestComponent {
  icon: IconRef | null = null;
}
