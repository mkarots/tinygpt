export function clientAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Fixed window of timestamps. Keys are caller-supplied (IP or session). */
export class SlidingWindowRateLimit {
  private hits = new Map<string, number[]>();

  constructor(
    private limit: number,
    private windowMs: number,
    private now: () => number = () => Date.now()
  ) {}

  allow(key: string): boolean {
    const time = this.now();
    const recent = (this.hits.get(key) ?? []).filter((stamp) => time - stamp < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(time);
    this.hits.set(key, recent);
    return true;
  }
}

export const chatRateLimit = new SlidingWindowRateLimit(20, 60_000);
