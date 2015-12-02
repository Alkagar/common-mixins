var mixinLogger = require('./mixins/simple-logger.js');
var mixinRedis = require('./mixins/redis.js');
var mixinEmitter = require('./mixins/emitter.js');
var simpleHttp = require('./http/simple-http.js');

module.exports = {
    mixins: {
        logger: mixinLogger,
        redis: mixinRedis,
        emitter: mixinEmitter
    },
    simpleHttp: simpleHttp
};
