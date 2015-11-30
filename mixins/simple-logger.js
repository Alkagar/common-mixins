var _ = require('lodash');
var bunyan = require('bunyan');

module.exports = function(obj, setup) {
    'use strict';
    setup = setup || {};
    var name = _.get(setup, 'name', 'Unnamed Logger');
    var level = _.get(setup, 'level', 'info');
    var direct = _.get(setup, 'direct', false);

    var bunyanLogger = bunyan.createLogger({
        name: name,
        level: level
    });

    var log = function(l, argsToLog) {
        if(level === 'off') {
            return false;
        }
        var toLog = Array.prototype.slice.call(argsToLog);
        bunyanLogger[l](toLog);
        return true;
    };

    var logger = {
        info: function() {
            return log('info', arguments);
        },
        warn: function() {
            return log('warn', arguments);
        },
        error: function() {
            return log('error', arguments);
        },
        fatal: function() {
            return log('fatal', arguments);
        },
        debug: function() {
            return log('debug', arguments);
        },
        trace: function() {
            return log('trace', arguments);
        }
    };

    if(direct) {
        obj.info = logger.info;
        obj.warn = logger.warn;
        obj.error = logger.error;
        obj.fatal = logger.fatal;
        obj.debug = logger.debug;
        obj.trace = logger.trace;
    } else {
        obj.logger = logger;
    }
    return obj;
};
