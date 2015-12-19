// import { React } from 'ddom'
import { Hub, Namespace } from './FactHub'
import { atom } from 'derivable'

const ns = Namespace('dogetext.counter');

export const Increment = ns.command<number>('increment');
export const Decrement = ns.command<number>('decrement');

const Incremented = ns.fact<number>('incremented');
const Decremented = ns.fact<number>('decremented');

export function Counter (max: number) {
  const $N = atom(0);
  const hub = Hub();

  hub.satisfy(Increment, $N, (n, i) => {
    let inc = Math.min(max - n, i);
    if (inc > 0) {
      return [Incremented(inc)];
    }
  });

  hub.satisfy(Decrement, $N, (n, i) => {
    let dec = Math.min(n, i);
    if (dec > 0) {
      return [Decremented(dec)]
    }
  });

  hub.reduce(Incremented, $N, (n, i) => n + i);
  hub.reduce(Decremented, $N, (n, i) => n - i);

  return {
    hub,
    $n: $N.derive(x => x)
    // elem: <span class='counter'>$N</span>
  };
}
