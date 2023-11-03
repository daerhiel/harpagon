import * as uuid from 'uuid';

import { applyMixins, buildUrl } from './utilities';

export const baseUrl = 'https://localhost';

describe('buildUrl', () => {
  it('should build version base url', () => {
    const actual = buildUrl(baseUrl, 'v1');

    expect(actual).toEqual(`${baseUrl}/v1`);
  });

  it('should build version / controller url', () => {
    const actual = buildUrl(baseUrl, 'v1', ['controller']);

    expect(actual).toEqual(`${baseUrl}/v1/controller`);
  });

  it('should build version / controller / id url', () => {
    const id = uuid.v4();
    const actual = buildUrl(baseUrl, 'v1', ['controller', id]);

    expect(actual).toEqual(`${baseUrl}/v1/controller/${id}`);
  });

  it('should build version single empty query url', () => {
    const actual = buildUrl(baseUrl, 'v1', ['controller'], {});

    expect(actual).toEqual(`${baseUrl}/v1/controller`);
  });

  it('should build version single string query url', () => {
    const name: string = 'query', value: string = 'value';
    const actual = buildUrl(baseUrl, 'v1', ['controller'], { [name]: value });

    expect(actual).toEqual(`${baseUrl}/v1/controller?${name}=${encodeURIComponent(value)}`);
  });

  it('should build version single number query url', () => {
    const name: string = 'query', value: number = 10;
    const actual = buildUrl(baseUrl, 'v1', ['controller'], { [name]: value });

    expect(actual).toEqual(`${baseUrl}/v1/controller?${name}=${encodeURIComponent(value)}`);
  });

  it('should build version single number query url', () => {
    const name: string = 'query', value: Date = new Date();
    const actual = buildUrl(baseUrl, 'v1', ['controller'], { [name]: value });

    expect(actual).toEqual(`${baseUrl}/v1/controller?${name}=${encodeURIComponent(value.toISOString())}`);
  });
});

export interface TargetClass {
}

export class TargetClass {
}

export class TestMethod {
  test(): void {
  }
}

export class PostMethod {
  post(): void {
  }
}

describe('applyMixins', () => {
  [
    { target: TargetClass, sources: [TestMethod] },
    { target: TargetClass, sources: [TestMethod, PostMethod] },
  ].forEach(test => {
    it(`should merge to '${test.target.name}' for '${test.sources.map(x => x.name)}'`, () => {
      applyMixins(test.target, ...test.sources);
      for (const source of test.sources) {
        for (const name of Object.getOwnPropertyNames(source.prototype)) {
          expect(Object.getOwnPropertyNames(test.target.prototype)).toContain(name);
        }
      }
    });
  });
});
