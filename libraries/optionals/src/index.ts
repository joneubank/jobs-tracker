export type Result<T, Err> = { ok: true; value: T } | { ok: false; error: Err };
export type Maybe<T> = { ok: true; value: T } | { ok: false };

export function maybe<T>(value: NonNullable<T> | undefined | null): Maybe<T> {
  return value ? { ok: true, value } : { ok: false };
}

export function success<T>(value: NonNullable<T>): Result<T, any> {
  return { ok: true, value };
}
export function failure<Err>(error: Err): Result<any, Err> {
  return { ok: false, error };
}

export function result<T, Err>(value: NonNullable<T> | null | undefined, error: Err): Result<T, Err> {
  return value ? { ok: true, value } : { ok: false, error };
}

// Chaining
// Based on the pipe builder syntax found here: https://stackoverflow.com/questions/65154695/typescript-types-for-a-pipe-function
function pipe<A, B>(fn: (a: A) => B) {
  return {
    build: () => fn,
    into: function <C>(g: (x: B) => C) {
      return pipe((arg: A) => g(fn(arg)));
    },
  };
}
// Example
// const collapse = (x: number[]) => x.reduce((acc, i) => acc + i, 0);
// const add = (x: number) => (y: number) => x + y;
// const wrap = (x: number) => ({ value: x });

// const process = pipe(collapse).into(add(3)).into(wrap).into(JSON.stringify).build();

// console.log(process([1]));
// console.log(process([1, 2]));
// console.log(process([1, 2, 3]));
