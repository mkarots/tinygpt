/** Dynamic route params are a string, or a one-item list in some Next typings. */
export function singleRouteParam(
  value: string | string[] | undefined | null
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;
  const id = raw.trim();
  return id.length > 0 ? id : undefined;
}
