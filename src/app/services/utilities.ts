import { Type } from "@angular/core";

export interface UrlParams {
  [key: string]: string | number | Date;
}

export function buildUrl(baseUrl: string, version: string, actions?: string[], params: UrlParams = {}): string {
  const parameters = new URLSearchParams();
  for (const name in params) {
    let param = params[name];
    if (param instanceof Date) {
      param = param.toISOString();
    } else if (typeof param === 'number') {
      param = param.toString();
    }
    parameters.set(name, param);
  }
  return [
    `${baseUrl}/${[version].concat(actions || []).join('/')}`,
    parameters.toString()
  ].filter(x => x?.length > 0).join('?');
}

export function applyMixins(target: Type<unknown>, ...constructors: Type<unknown>[]) {
  constructors.forEach(base => Object.getOwnPropertyNames(base.prototype)
    .forEach(name => Object.defineProperty(target.prototype, name,
      Object.getOwnPropertyDescriptor(base.prototype, name) ||
      Object.create(null)
    ))
  );
}

export function coalesce(value: number | null, fallback: number): number;
export function coalesce(value: number | null, fallback: null): number | null;
export function coalesce(value: number | null, fallback: number | null): number | null;
export function coalesce(value: number | null, fallback: number | null): number | null {
  return value != null && !isNaN(value) ? value : fallback;
}

export function product(a: number, b: number): number;
export function product(a: number, b: number | null): number | null;
export function product(a: number | null, b: number): number | null;
export function product(a: number | null, b: number | null): number | null;
export function product(a: number | null, b: number | null): number | null {
  if (a == null || isNaN(a)) {
    return null;
  }
  if (b == null || isNaN(b)) {
    return null;
  }
  return a * b;
}

export function ratio(a: number, b: number): number;
export function ratio(a: number, b: number | null): number | null;
export function ratio(a: number | null, b: number): number | null;
export function ratio(a: number | null, b: number | null): number | null;
export function ratio(a: number | null, b: number | null): number | null {
  if (a == null || isNaN(a)) {
    return null;
  }
  if (b == null || isNaN(b)) {
    return null;
  }
  return a / b;
}

export function sum(a: number, b: number): number;
export function sum(a: number, b: number | null): number;
export function sum(a: number | null, b: number): number;
export function sum(a: number | null, b: number | null): number | null;
export function sum(a: number | null, b: number | null): number | null {
  if ((a == null || isNaN(a)) && (b == null || isNaN(b))) {
    return null;
  }
  if (a == null || isNaN(a)) {
    return b;
  }
  if (b == null || isNaN(b)) {
    return a;
  }
  return a + b;
}

export function subtract(a: number, b: number): number;
export function subtract(a: number, b: number | null): number;
export function subtract(a: number | null, b: number): number;
export function subtract(a: number | null, b: number | null): number | null;
export function subtract(a: number | null, b: number | null): number | null {
  if ((a == null || isNaN(a)) && (b == null || isNaN(b))) {
    return null;
  }
  if (a == null || isNaN(a)) {
    return b;
  }
  if (b == null || isNaN(b)) {
    return a;
  }
  return a - b;
}
