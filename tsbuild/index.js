"use strict";
var Counter = require('./counter');
var ddom_1 = require('ddom');
var counter = Counter.Counter(10);
var inc = function () { return counter.hub.give(Counter.Increment(1)); };
var dec = function () { return counter.hub.give(Counter.Decrement(1)); };
var counterDiv = (ddom_1.React.createElement("div", null, ddom_1.React.createElement("h3", null, counter.$n), ddom_1.React.createElement("a", {onclick: inc}, "+"), " ", ddom_1.React.createElement("a", {onclick: dec}, "-")));
window.addEventListener('load', function () {
    ddom_1.root(document.body, counterDiv);
});
