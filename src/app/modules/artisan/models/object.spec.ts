import { Object } from './object';

describe('Resource', () => {
  it('should create an instance', () => {
    expect(new Object(null!, {})).toBeTruthy();
  });
});
