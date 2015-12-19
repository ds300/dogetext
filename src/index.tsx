import * as Counter from './counter'
import { React, root } from 'ddom'

const counter = Counter.Counter(10);
const inc = () => counter.hub.give(Counter.Increment(1));
const dec = () => counter.hub.give(Counter.Decrement(1));

const counterDiv = (
  <div>
    <h3>{counter.$n}</h3>
    <a onclick={inc}>+</a> <a onclick={dec}>-</a>
  </div>
);

window.addEventListener('load', () => {
  root(document.body, counterDiv);
});
