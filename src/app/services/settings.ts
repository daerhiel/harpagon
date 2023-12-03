export function getStorageItem<T>(propertyName: string, fallback: T): T {
  try {
    const payload = localStorage.getItem(propertyName);
    if (payload) {
      return JSON.parse(payload);
    }
  } catch {
    localStorage.removeItem(propertyName);
  }
  return fallback;
}

export function setStorageItem<T>(propertyName: string, value: T): T {
  try {
    localStorage.setItem(propertyName, JSON.stringify(value));
  } catch {
    localStorage.removeItem(propertyName);
  }
  return value;
}
