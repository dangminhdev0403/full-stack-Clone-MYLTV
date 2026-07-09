export function pageFrom(value: unknown): number {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function limitFrom(value: unknown): number {
  const parsed = Number(value ?? 20);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 20;
  }
  return Math.min(Math.floor(parsed), 100);
}

export function skipFrom(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') {
    return undefined;
  }
  return trimmed;
}

export function boolFrom(value: unknown): boolean | undefined {
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
}

export function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}
