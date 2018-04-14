export function arraysum(x): number {
  let n=0.0;
  for (let i=0; i<x.length; i++) {
    n += x[i];
  }
  return n;
}
