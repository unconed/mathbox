export function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

export function cosine(x) {
  return 0.5 - 0.5 * Math.cos(clamp(x, 0, 1) * Math.PI);
}

export function binary(x) {
  return +(x >= 0.5);
}

export function hold(x) {
  return +(x >= 1);
}
