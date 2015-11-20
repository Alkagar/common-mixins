var mixinLogger = require('./mixins/logger.js');
var mixinRedis = require('./mixins/redis.js');
var simpleHttp = require('./http/simple-http.js');

module.exports = {
    mixins: {
        logger: mixinLogger,
        redis: mixinRedis
    },
    simpleHttp: simpleHttp
};
