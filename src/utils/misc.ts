export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
