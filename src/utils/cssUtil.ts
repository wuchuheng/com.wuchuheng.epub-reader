/**
 * Concatenate class names.
 * @param args - Class names to concatenate.
 * @returns Concatenated class names.
 */
export function cn(...args: (string | undefined)[]) {
  return args.filter(Boolean).join(' ');
}
