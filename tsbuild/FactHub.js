"use strict";
var derivable_1 = require('derivable');
var actualGlobal = (global || window);
var nameRegistry = {};
actualGlobal.___facthub_namespace_registry___ = nameRegistry;
function Namespace(ns) {
    function qualify(name) {
        name = ns + '/' + name;
        if (nameRegistry[name]) {
            throw new Error("duplicate fact/command name '" + name + "'");
        }
        nameRegistry[name] = true;
        return name;
    }
    return {
        fact: function (name) {
            name = qualify(name);
            var cons = function (fact) { return [name, fact]; };
            cons['___fact_name___'] = name;
            return cons;
        },
        command: function (f, name) {
            if (typeof f === 'string') {
                name = qualify(f);
                var cons = function (command) { return [name, command]; };
                cons['___command_name___'] = name;
                return cons;
            }
            else {
                if (f.___command_name___) {
                    throw new Error("fact function used twice " + f.___command_name___);
                }
                if (arguments.length === 1) {
                    name = f.name;
                }
                name = qualify(name);
                var ret = function () {
                    return [name, f.apply(null, arguments)];
                };
                ret['___command_name___'] = name;
                return ret;
            }
        }
    };
}
exports.Namespace = Namespace;
function FactHub() {
    var handlers = {};
    return {
        reduce: function (cons, atom, reducer) {
            var existing = handlers[cons.___fact_name___];
            if (existing) {
                existing.push([atom, reducer]);
            }
            else {
                handlers[cons.___fact_name___] = [[atom, reducer]];
            }
        },
        tell: function (_a) {
            var updateName = _a[0], data = _a[1];
            var updateHandlers = handlers[updateName];
            if (updateHandlers) {
                derivable_1.atomically(function () {
                    updateHandlers.forEach(function (_a) {
                        var atom = _a[0], reducer = _a[1];
                        atom.swap(reducer, data);
                    });
                });
            }
        },
    };
}
exports.FactHub = FactHub;
function CommandHub(factListener) {
    var handlers = {};
    return {
        satisfy: function (cons, context, transformer) {
            if (!cons.___command_name___) {
                console.error('not a command', cons);
            }
            if (handlers[cons.___command_name___]) {
                throw new Error('commands may only be fulfilled once: ' + cons.___command_name___);
            }
            else {
                handlers[cons.___command_name___] = function (data) {
                    var facts = transformer(context.get(), data);
                    if (facts) {
                        if (facts instanceof Array) {
                            if (facts.length > 0) {
                                derivable_1.atomically(function () {
                                    facts.forEach(factListener.tell);
                                });
                            }
                        }
                        else {
                            throw new Error('not facts: ' + facts);
                        }
                    }
                };
            }
        },
        give: function (_a) {
            var commandName = _a[0], data = _a[1];
            var handler = handlers[commandName];
            if (handler) {
                handler(data);
            }
            else {
                throw new Error('no handler for command ' + commandName);
            }
        }
    };
}
exports.CommandHub = CommandHub;
function Hub() {
    var factHub = FactHub();
    var reduce = factHub.reduce, tell = factHub.tell;
    var _a = CommandHub(factHub), satisfy = _a.satisfy, give = _a.give;
    return { reduce: reduce, tell: tell, satisfy: satisfy, give: give };
}
exports.Hub = Hub;
