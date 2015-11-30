var mixinLogger = require('./mixins/simple-logger.js');
var mixinRedis = require('./mixins/redis.js');
var mixinEmmiter = require('./mixins/emmiter.js');
var simpleHttp = require('./http/simple-http.js');

module.exports = {
    mixins: {
        logger: mixinLogger,
        redis: mixinRedis,
        emmiter: mixinEmmiter
    },
    simpleHttp: simpleHttp
};
