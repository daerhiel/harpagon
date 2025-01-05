import { Equipment } from './equipment';

describe('Equipment', () => {
  it('should create an instance', () => {
    expect(new Equipment(null!, 'Cooking', 250)).toBeTruthy();
  });
});
