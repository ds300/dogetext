/**
 * Reduxish event sourcing.
 */

import { atomically, Atom, Derivable } from 'derivable'

declare function Symbol(name: string): {};

export type Reducer<T, E> = (t: T, e: E) => T;
export type CommandTransfomer<Context, Command> = (t: Context, e: Command) => Fact<any>[];

export interface FactListener {
  tell<T>(fact: Fact<T>): void;
}

export interface Facts {
  reduce<T, E>(
    selector: FactType<E>,
    atom: Atom<T>,
    reducer: Reducer<T, E>
  ): void;
}

export type FactHub = FactListener & Facts;

export interface Commandable {
  give<T>(command: Command<T>): void;
}

export interface Commands {
  satisfy<C, T>(
    commandType: (...args) => Command<T>,
    context: Derivable<C>,
    transformer: CommandTransfomer<C, T>
  ): void;
}

export type CommandHub = Commandable & Commands;

export type Command<A> = [string, A];

export type FactType<A> = (fact: A) => Fact<A>;
export type Fact<A> = [string, A];

export type Hub = CommandHub & FactHub;

declare const global;
declare const window;
const actualGlobal = (global || window);

const nameRegistry = {};

actualGlobal.___facthub_namespace_registry___ = nameRegistry;

export interface Namespace {
  command<A, Z>(f: (a: A) => Z, name?: string): (a: A) => Command<Z>;
  command<A, B, Z>(f: (a: A, b: B) => Z, name?: string): (a: A, b: B) => Command<Z>;
  command<A, B, C, Z>(f: (a: A, b: B, c: C) => Z, name?: string): (a: A, b: B, c: C) => Command<Z>;
  command<A, B, C, D, Z>(f: (a: A, b: B, c: C, d: D) => Z, name?: string): (a: A, b: B, c: C, d: D) => Command<Z>;
  command<A, B, C, D, E, Z>(f: (a: A, b: B, c: C, d: D, e: E) => Z, name?: string): (a: A, b: B, c: C, d: D, e: E) => Command<Z>;
  command<A, B, C, D, E, F, Z>(f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z, name?: string): (a: A, b: B, c: C, d: D, e: E, f: F) => Command<Z>;
  fact<A>(name: string): FactType<A>;
  command<A>(name: string): (a: A) => Command<A>;
}

export function Namespace (ns): Namespace {
  function qualify (name) {
    name = ns + '/' + name;

    if (nameRegistry[name]) {
      throw new Error(`duplicate fact/command name '${name}'`);
    }

    nameRegistry[name] = true;

    return name;
  }
  return {
    fact<T>(name): FactType<T>  {
      name = qualify(name);
      const cons = fact => [name, fact];
      cons['___fact_name___'] = name;
      return <any>cons;
    },
    command (f, name?) {
      if (typeof f === 'string') {
        name = qualify(f);
        const cons = command => [name, command];
        cons['___command_name___'] = name;
        return cons;
      } else {
        if (f.___command_name___) {
          throw new Error(`fact function used twice ${f.___command_name___}`);
        }
        if (arguments.length === 1) {
          name = f.name;
        }

        name = qualify(name);

        const ret = function () {
          return <any>[name, f.apply(null, arguments)];
        }

        ret['___command_name___'] = name;

        return <any>ret;
      }
    }
  };
}

export function FactHub(): FactHub {
  const handlers = {};

  return {
    reduce (cons, atom, reducer) {
      let existing = handlers[cons.___fact_name___];
      if (existing) {
        existing.push([atom, reducer]);
      } else {
        handlers[cons.___fact_name___] = [[atom, reducer]];
      }
    },
    tell ([updateName, data]) {
      let updateHandlers = handlers[updateName];
      if (updateHandlers) {
        atomically(() => {
          updateHandlers.forEach(([atom, reducer]) => {
            atom.swap(reducer, data);
          });
        });
      }
    },
  };
}

export function CommandHub(factListener: FactListener): CommandHub {
  const handlers = {};

  return {
    satisfy (cons, context, transformer) {
      if (!cons.___command_name___) {
        console.error('not a command', cons);
      }
      if (handlers[cons.___command_name___]) {
        throw new Error('commands may only be fulfilled once: ' + cons.___command_name___);
      } else {
        handlers[cons.___command_name___] = data => {
          const facts = transformer(context.get(), data);
          if (facts) {
            if (facts instanceof Array) {
              if (facts.length > 0) {
                atomically(() => {
                  facts.forEach(factListener.tell);
                });
              }
            } else {
              throw new Error('not facts: ' + facts);
            }
          }
        };
      }
    },
    give ([commandName, data]) {
      const handler = handlers[commandName];
      if (handler) {
        handler(data);
      } else {
        throw new Error('no handler for command ' + commandName);
      }
    }
  };
}

export function Hub(): Hub {
  const factHub = FactHub();
  const {reduce, tell} = factHub;
  const {satisfy, give} = CommandHub(factHub);
  return {reduce, tell, satisfy, give};
}
