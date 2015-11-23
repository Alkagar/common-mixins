var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

module.exports = function(obj, setup) {
    'use strict';
    var emmiter = new EventEmitter();
    console.log(emmiter);
    obj.emmiter = emmiter;
    return obj;
};
