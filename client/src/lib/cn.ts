// Tiny classNames helper — joins truthy class fragments (no external deps).
type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
