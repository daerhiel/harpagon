import { Entity } from './entity';

describe('Entity', () => {
  it('should create an instance', () => {
    expect(new Entity(null!, null!, {})).toBeTruthy();
  });
});
