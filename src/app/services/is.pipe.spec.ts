import { IsPipe } from './is.pipe';

describe('IsPipe', () => {
  it('create an instance', () => {
    const pipe = new IsPipe();
    expect(pipe).toBeTruthy();
  });
});
