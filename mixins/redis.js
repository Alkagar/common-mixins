'use strict';

var _ = require('lodash');
var redis = require('redis');
var logger = require('./logger.js');

var log = logger({}, {
    name: 'Redis Connection',
    direct: true
});

var clients = {
    publisher: null,
    subscriber: null
};

function onError(callback) {
    return function(err) {
        log.error({message: 'Redis connection error.', error: err});
        if (typeof callback === 'function') {
            callback(err);
        }
    };
}

function onReady(callback) {
    return function() {
        log.info({message: 'Redis connection established.'});
        if (typeof callback === 'function') {
            callback();
        }
    };
}

function parseOptions(options) {
    if (typeof options.retry_max_delay === 'undefined') {
        options.retry_max_delay = 60 * 1000;
    }
    return options;
}

function createClientName(setup) {
    var host = setup.host || 'localhost';
    var port = setup.port || '6379';
    return host + ':' + port;
}

function createClient(type, setup) {

    setup = setup || {};
    var clientName = createClientName(setup);
    if (_.get(clients, clientName + '.' + type, null) !== null) {
        return;
    }

    var host = setup.host || 'localhost';
    var port = setup.port || '6379';
    var options = setup.options || {};

    var userOnError = setup.onError || _.noop;
    var userOnReady = setup.onReady || _.noop;

    clients[clientName] = {};

    options = parseOptions(options);
    clients[clientName][type] = redis.createClient(port, host, options);
    clients[clientName][type].on('error', onError(userOnError));
    clients[clientName][type].on('ready', onReady(userOnReady));
}

module.exports = function(obj, setup) {

    setup = setup || {};
    // type: publisher or subscriber
    var type = setup.type || 'publisher';
    var clientName = createClientName(setup);

    createClient(type, setup);

    obj.redisClient = function(type) {
        var type = type || 'publisher';
        return clients[clientName][type];
    };

    return obj;
};
