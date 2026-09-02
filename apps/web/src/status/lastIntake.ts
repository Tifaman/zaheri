const STORAGE_KEY = 'zaheri.lastIntakeId';

export function saveLastIntakeId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function getLastIntakeId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
