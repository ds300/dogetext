/**
 * Reduxish event sourcing.
 */

import { atomically, Atom } from 'derivable'

declare function Symbol(name: string): {};

export type Reducer<T, E> = (t: T, e: E) => T;

export interface FactHub {
  submit<T>(fact: Fact<T>): void;
  reduce<T, E>(
    factConstructor: FactConstructor<E>,
    atom: Atom<T>,
    reducer: Reducer<T, E>
  ): void;
}

export type Fact<A> = [string, A];

export type FactConstructor<A> = (...args: any[]) => Fact<A>;

declare const global;
declare const window;
const actualGlobal = (global || window);

const registry = {};

actualGlobal.___fact_name_registry___ = registry;

export function define<A, Z>(f: (a: A) => Z, name?: string): (a: A) => Fact<Z>;
export function define<A, B, Z>(f: (a: A, b: B) => Z, name?: string): (a: A, b: B) => Fact<Z>;
export function define<A, B, C, Z>(f: (a: A, b: B, c: C) => Z, name?: string): (a: A, b: B, c: C) => Fact<Z>;
export function define<A, B, C, D, Z>(f: (a: A, b: B, c: C, d: D) => Z, name?: string): (a: A, b: B, c: C, d: D) => Fact<Z>;
export function define<A, B, C, D, E, Z>(f: (a: A, b: B, c: C, d: D, e: E) => Z, name?: string): (a: A, b: B, c: C, d: D, e: E) => Fact<Z>;
export function define<A, B, C, D, E, F, Z>(f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z, name?: string): (a: A, b: B, c: C, d: D, e: E, f: F) => Fact<Z>;
export function define(f, name?) {
  if (arguments.length === 1) {
    name = f.name;
  } else {
    name = name.toString();
  }

  if (registry[name]) {
    throw new Error(`duplicate fact name '${name}'`);
  }

  registry[name] = true;

  f.___fact_name___ = name;
  return function () {
    return <any>[name, f.apply(null, arguments)];
  }
}

export function FactHub(): FactHub {
  const handlers = {};

  return {
    reduce: (cons, atom, reducer) => {
      let existing = handlers[cons.___fact_name___];
      if (existing) {
        existing.push([atom, reducer]);
      } else {
        handlers[cons.___fact_name___] = [[atom, reducer]];
      }
    },
    submit: ([updateName, data]) => {
      let updateHandlers = handlers[updateName];
      if (updateHandlers) {
        atomically(() => {
          updateHandlers.forEach(([atom, reducer]) => {
            atom.swap(reducer, data);
          });
        });
      }
    }
  };
}
