/** Tiny className joiner — filters out falsy values and joins with spaces. */
export function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}
