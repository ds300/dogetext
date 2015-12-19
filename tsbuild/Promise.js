"use strict";
function Promise(cons) {
    var _this = this;
    var resolved = false;
    var resolvedValue = null;
    var resolutionListeners = [];
    var rejected = false;
    var rejectedReason = null;
    var rejectionListeners = [];
    var resolve = function (value) {
        if (!resolved && !rejected) {
            resolved = true;
            resolvedValue = value;
            resolutionListeners.forEach(function (w) { return w(value); });
            resolutionListeners = [];
            rejectionListeners = [];
        }
        else {
            throw new Error('promise already resolved or rejected');
        }
    };
    var reject = function (reason) {
        if (!resolved && !rejected) {
            rejected = true;
            rejectedReason = reason;
            rejectionListeners.forEach(function (w) { return w(reason); });
            rejectionListeners = [];
            resolutionListeners = [];
        }
        else {
            throw new Error('promise already resolved or rejected');
        }
    };
    cons(resolve, reject);
    this.then = function (onFulfilled, onRejected) {
        return new Promise(function (resolve, reject) {
            if (onFulfilled) {
                if (resolved) {
                    var next = onFulfilled(resolvedValue);
                    if (next instanceof Promise) {
                        next.then(resolve, reject);
                    }
                    else {
                        resolve(next);
                    }
                }
                else if (!rejected) {
                    resolutionListeners.push(function (value) {
                        var next = onFulfilled(value);
                        if (next instanceof Promise) {
                            next.then(resolve, reject);
                        }
                        else {
                            resolve(next);
                        }
                    });
                }
            }
            if (onRejected) {
                if (rejected) {
                    var next = onRejected(rejectedReason);
                    if (next instanceof Promise) {
                        next.then(resolve, reject);
                    }
                    else {
                        reject(next);
                    }
                }
                else if (!rejected) {
                    rejectionListeners.push(function (reason) {
                        var next = onRejected(reason);
                        if (next instanceof Promise) {
                            next.then(resolve, reject);
                        }
                        else {
                            reject(next);
                        }
                    });
                }
            }
        });
    };
    this.catch = function (onRejected) {
        return _this.then(null, onRejected);
    };
}
exports.Promise = Promise;
var Promise;
(function (Promise) {
    function all(promises) {
        return new Promise(function (resolve, reject) {
            var n = promises.length;
            var numResolved = 0;
            var result = Array(n);
            var rejected = false;
            promises.forEach(function (p, i) {
                p.then(function (v) {
                    if (!rejected) {
                        result[i] = v;
                        numResolved++;
                        if (numResolved === n) {
                            resolve(result);
                        }
                    }
                }, function (reason) {
                    if (!rejected) {
                        rejected = true;
                        reject(reason);
                    }
                });
            });
        });
    }
    Promise.all = all;
    function race(promises) {
        return new Promise(function (resolve, reject) {
            var raceOver = false;
            promises.forEach(function (p) {
                p.then(function (v) {
                    if (!raceOver) {
                        raceOver = true;
                        resolve(p);
                    }
                }, function (reason) {
                    if (!raceOver) {
                        raceOver = true;
                        reject(reason);
                    }
                });
            });
        });
    }
    Promise.race = race;
    function reject(reason) {
        return Promise(function (_, reject) { return reject(reason); });
    }
    Promise.reject = reject;
    function resolve(value) {
        return Promise(function (resolve, _) { return resolve(value); });
    }
    Promise.resolve = resolve;
})(Promise = exports.Promise || (exports.Promise = {}));
