"use strict";
var FactHub_1 = require('./FactHub');
var derivable_1 = require('derivable');
var ns = FactHub_1.Namespace('dogetext.counter');
exports.Increment = ns.command('increment');
exports.Decrement = ns.command('decrement');
var Incremented = ns.fact('incremented');
var Decremented = ns.fact('decremented');
function Counter(max) {
    var $N = derivable_1.atom(0);
    var hub = FactHub_1.Hub();
    hub.satisfy(exports.Increment, $N, function (n, i) {
        var inc = Math.min(max - n, i);
        if (inc > 0) {
            return [Incremented(inc)];
        }
    });
    hub.satisfy(exports.Decrement, $N, function (n, i) {
        var dec = Math.min(n, i);
        if (dec > 0) {
            return [Decremented(dec)];
        }
    });
    hub.reduce(Incremented, $N, function (n, i) { return n + i; });
    hub.reduce(Decremented, $N, function (n, i) { return n - i; });
    return {
        hub: hub,
        $n: $N.derive(function (x) { return x; })
    };
}
exports.Counter = Counter;
