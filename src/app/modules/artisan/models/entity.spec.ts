import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IObject, ObjectRef } from '@app/modules/nw-db/nw-db.module';
import { GamingToolsService } from '@app/modules/gaming-tools/gaming-tools.module';

import { setInjector } from '../artisan.service';
import { Entity } from './entity';
import { Materials } from './materials';

const entities: ObjectRef[] = [
  { id: '1', type: 'item' },
];

describe('Entity', () => {
  let materials: Materials;
  let index: Record<string, IObject>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GamingToolsService, useValue: jasmine.createSpyObj<GamingToolsService>('GamingToolsService', ['commodities']) }
      ]
    }).compileComponents();
    setInjector(TestBed.inject(Injector));
    materials = new Materials();
    index = {};
  });

  entities.forEach(entity => {
    it(`should create an instance: ${entity.id}`, () => {
      expect(new Entity(materials, entity, index)).toBeTruthy();
    });
  });
});
