var _ = require('lodash');
var bunyan = require('bunyan');

module.exports = function(obj, setup) {
    'use strict';
    setup = setup || {};
    var name = _.get(setup, 'name', 'Unnamed Logger');
    var level = _.get(setup, 'level', 'info');

    var bunyanLogger = bunyan.createLogger({
        name: name,
        level: level
    });

    var log = function(level, argsToLog) {
        var toLog = Array.prototype.slice.call(argsToLog);
        if(typeof toLog[0] === 'string') {
            toLog.unshift(name);
        } else {
            toLog[0].loggerName = name;
        }

        bunyanLogger[level](toLog);
    };

    var logger = {
        info: function() {
            log('info', arguments);
        },
        warn: function() {
            log('warn', arguments);
        },
        error: function() {
            log('error', arguments);
        },
        fatal: function() {
            log('fatal', arguments);
        },
        debug: function() {
            log('debug', arguments);
        },
        trace: function() {
            log('trace', arguments);
        }
    };

    obj.logger = logger;

    return obj;
};
