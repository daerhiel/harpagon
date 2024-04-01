import { Subject } from 'rxjs';

import { Subscriptions } from './subscriptions';

describe('Subscriptions', () => {
  const subscriptions = new Subscriptions();

  it('should create', () => {
    expect(subscriptions).toBeTruthy();
  });

  it('should subscribe to an observable', () => {
    const subject1 = new Subject<number>();
    const subject2 = new Subject<number>();
    subscriptions.subscribe(subject1);
    subscriptions.subscribe(subject2);

    expect(subject1.observed).toBeTrue();
    expect(subject2.observed).toBeTrue();
  });

  it('should unsubscribe from all observables', () => {
    const subject1 = new Subject<number>();
    const subject2 = new Subject<number>();
    subscriptions.subscribe(subject1);
    subscriptions.subscribe(subject2);

    subscriptions.unsubscribe();

    expect(subject1.observed).toBeFalse();
    expect(subject2.observed).toBeFalse();
  });
});
