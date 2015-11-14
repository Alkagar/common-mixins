var mixinLogger = require('./mixins/logger.js');
var simpleHttp = require('./http/simple-http.js');

module.exports = {
    mixins: {
        logger: mixinLogger,
    },
    simpleHttp: simpleHttp
};
