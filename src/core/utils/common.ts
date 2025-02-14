// Please make a wait function

import { trueMap } from "./maps";

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
  * @name "makerandstr"
  * @comment "Generates an random string of characters"
  * @author "xA_Emiloetjex"
  */
export function makerandstr(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-+=.,/:;~!@&*";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
  * @name "mkRandStr2"
  * @comment "Generates an random string with the given characters"
  * @author "xA_Emiloetjex"
 */
export function mkRandStr2(length: number, chars: string): string {
  let result = "";
  const characters =
    chars;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

    ////@ts-expect-error//
export let uniqueStore: string[] = []

let last_tried = "";

export function UniqueGen(generator: (length: number) => string, length:number, retries_max = 10, retries_count = 0, extraCheckFn = function(result: string):boolean {return false}) {
  if (retries_max >= retries_count) {
    // console.log(uniqueStore)
    const newGen = generator(length);
    last_tried = newGen
    // console.log(extraCheckFn(newGen))
    ////@ts-expect-error//
    if (uniqueStore.includes(newGen)
      || extraCheckFn(newGen) === true
    ) {
      // console.log(`Generated port of ${newGen} which is either already in use/generated, or is in the reserved range, retries left: ${retries_max - retries_count}/${retries_max} (retry: ${retries_count}).`)
      // wait(3000)
      return UniqueGen(generator, length, retries_max, retries_count+1)
    }
    else {
      uniqueStore.push(newGen)
      return newGen
    }
  } else return JSON.stringify(Error(JSON.stringify({_:"couldn't generate a new value within the allowed limit", last_tried})));
}

/**
 * @function mkRandStr3
 * @param {number} length
 * @param {string} chars 
 * @description
 * This is the same as `mkRandStr2`.
 * 
 * But is also implements `UniqueGen`.
 * 
 * The implementation literally looks like this:
 * ```ts
 * export function mkRandStr3(length: number, chars: string): string {
 *    return UniqueGen((_length:number) => mkRandStr2(_length, chars), length)
 * }
 * ```
 */
export function mkRandStr3(length: number, chars: string, retry_max = 10): string {
  return UniqueGen((_length:number) => mkRandStr2(_length, chars), length, retry_max, 0)
}

export function decimalToHexString(number:number) {
  if (number < 0) {
    number = 0xffffffff + number + 1;
  }

  return number.toString(16).toUpperCase();
}

export function splitArray(array: any[], size: number): any[][] {
  const chunkSize = size;
  let chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// splitArray([1,2,3,4,5,6,7,8,9,10], 5)
// [
//   [1,2,3,4,5],
//   [6,7,8,9,10]
// ]

export function findMap(array: any[], by:string, id:string) {
  console.log(by, id);

  let Target = 0;
  array.forEach((item, index) => {
    if (item[by] == id) return (Target = index);
    else return;
  });
  return Target;
}

export function removeFromArray(Arr: any[], Str: any): any[] {
  let WorkFlow;
  WorkFlow = Arr.join(",");
  WorkFlow = WorkFlow.replace("," + Str, "");
  WorkFlow = WorkFlow.split(",");
  return WorkFlow;
}
export function getFromArray(Arr: any[], ID: number): any {
  let temp_1;

  Arr.forEach((item, index) => {
    item.index = index;
    if (item.ID == ID) return (temp_1 = item);
    else return;
  });

  return temp_1;
}

export const ArrayManipulation = {
  splitArray,
  findMap,
  removeFromArray,
  getFromArray,
};

export const idxMap = trueMap<string, number>();

export function newIndex(namespace: string) {
  if (!idxMap.has(namespace)) {
    idxMap.set(namespace, 0);
  }
  const idx = idxMap.get(namespace);
  idxMap.set(namespace, <any>idx + 1);
  return idx;
}