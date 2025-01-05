import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ArtisanComponent } from './artisan.component';

describe('ArtisanComponent', () => {
  let component: ArtisanComponent;
  let fixture: ComponentFixture<ArtisanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, ArtisanComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtisanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
