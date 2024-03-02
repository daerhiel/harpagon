import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NwIconDirective } from './nw-icon.directive';
import { IconRef } from './nw-db.module';

const iconSourceRefs: IconRef[] = [
  { icon: 'icons/items/consumable/watert1' },
  { icon: 'lyshineui/images/weapon_icons/weapon_icon_sword.png' }
]

fdescribe('NwIconDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should render default image source', () => {
    const img = fixture.debugElement.query(By.css('img'));
    expect(img.nativeElement.src).toMatch(/soon.png$/i);
  });

  iconSourceRefs.forEach((ref) => {
    it(`should render correct image source: ${ref.icon}`, () => {
      component.icon = ref;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.src).toMatch(`${ref.icon}.png$`);
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
