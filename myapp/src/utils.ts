import * as _ from 'lodash';

export function arraysum(x): number {
  let n=0.0;
  for (let i=0; i<x.length; i++) {
    n += x[i];
  }
  return n;
}

export function arraydivide_inplace(arr: number[] | Float32Array | Float64Array, Z: number) {
  for (let i=0; i<arr.length; i++) {
    arr[i] = arr[i]/Z;
  }
  return arr;
}

export function arraynormalize_inplace(arr: number[] | Float32Array | Float64Array) {
  let Z = arraysum(arr);
  arraydivide_inplace(arr, Z);
  return arr;
}
/** like numpy argsort() or R order()
 * first value of returned array is the index of the lowest input value.
 * second value of returned array is index of the second-lowest input value.
 * etc.
 */
export function argsort(arr:Array<number>): Array<number> {
  if (arr===null || arr===undefined) throw "bad argument";
  return _.sortBy(_.range(arr.length), (ind) => arr[ind]);
}

export function setintersect(xx:Set<any>, yy:Set<any>) {
  if (xx===null || xx===undefined || yy===null || yy===undefined) throw "bad argument";
  return new Set(Array.from(xx).filter((x) => yy.has(x)));
}
export function setunion_many(manysets:Array<Set<any>>) {
  let flat = manysets.map((x)=>Array.from(x))
    .reduce( (prev,cur) => prev.concat(cur));
  return new Set(flat);
}
export function setunion(xx:Set<any>, yy:Set<any>) {
  if (xx===null || xx===undefined || yy===null || yy===undefined) throw "bad argument";
  return new Set(Array.from(xx).concat(Array.from(yy)));
}
export function setdiff(xx:Set<any>, yy:Set<any>) {
  if (xx===null || xx===undefined || yy===null || yy===undefined) throw "bad argument";
  return new Set(Array.from(xx).filter((x) => !yy.has(x)));
}