import { InstancePipe } from './instance.pipe';

describe('InstancePipe', () => {
  it('create an instance', () => {
    const pipe = new InstancePipe();
    expect(pipe).toBeTruthy();
  });
});
