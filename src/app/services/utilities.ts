export interface UrlParams {
  [key: string]: any
}

export function buildUrl(baseUrl: string, version: string, actions?: string[], params: UrlParams = {}): string {
  const parameters = new URLSearchParams();
  for (const name in params) {
    let param = params[name];
    if (param instanceof Date) {
      param = param.toISOString();
    }
    parameters.set(name, param);
  }
  return [
    `${baseUrl}/${[version].concat(actions || []).join('/')}`,
    parameters.toString()
  ].filter(x => x?.length > 0).join('?');
}

export function applyMixins(target: any, ...constructors: any[]) {
  constructors.forEach(base => Object.getOwnPropertyNames(base.prototype)
    .forEach(name => Object.defineProperty(target.prototype, name,
      Object.getOwnPropertyDescriptor(base.prototype, name) ||
      Object.create(null)
    ))
  );
}
