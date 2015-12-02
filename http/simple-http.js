'use strict';

var path = require('path');
var url = require('url');
var http = require('http');
var _ = require('lodash');
var logger = require(path.join(__dirname, '../mixins/simple-logger.js'));

module.exports = function(setup) {
    var obj = {};
    setup.name = setup.name || 'Unnamed HTTP Server';
    obj.name = setup.name;

    var level = _.get(setup, 'logLevel', 'info');
    logger(obj, {
        name: setup.name,
        level: level
    });

    var server = null;
    var port = setup.port || 7000;
    var host = setup.host || '0.0.0.0';
    var headers = setup.headers || {};
    var userError = _.get(setup, 'error', _.noop);

    setup.routes = setup.routes || {};

    function addRoutes(routes) {
        for (var i in routes) {
            if (routes.hasOwnProperty(i)) {
                setup.routes[i] = routes[i];
            }
        }
    }

    // options['Access-Control-Allow-Origin'] = '*';
    function modifyHeaders(userHeaders) {
        headers = _.assign(headers, userHeaders);
        headers = _.pick(headers, _.identity);
    }

    function writeResponse(response, status, content, options) {
        options = options || {
            'Content-Type': 'text/html'
        };
        var newHeaders = _.assign(headers, options);
        response.writeHead(status, newHeaders);
        response.write(content);
    }

    function defaultRouter(request, response) {
        var fullUrl = 'http://' + request.headers.host + request.url;
        var parsedUrl = url.parse(fullUrl);
        var urlFunction = parsedUrl.pathname.slice(1);
        var method = request.method.toLowerCase();
        var handlerName = method + urlFunction.charAt(0).toUpperCase() + urlFunction.slice(1);

        obj.logger.info({
            'route': fullUrl,
            'handler': handlerName,
            'method': method.toUpperCase(),
            'ip': request.connection.remoteAddress
        });

        if (typeof setup.routes[handlerName] === 'function') {
            setup.routes[handlerName](request, response);
        } else {
            writeResponse(response, 404, 'Default Router. This request is not supported yet. Please contact administrator.');
            response.end();
        }
    }

    function _createServer(callback) {
        if (server !== null) {
            obj.logger.warn({
                message: 'Skipping, server already created.'
            });
            return;
        }
        server = http.createServer(defaultRouter);

        server.on('listening', function() {
            obj.logger.info({message: 'Server start listening.', host: host, port: port});
            if (typeof callback === 'function') {
                callback();
            }
        });

        server.on('error', function(err) {
            obj.logger.error({message: 'There was an error with http server.', host: host, port: port, error: err});
            userError(err);
        });
        server.listen({'port': port, 'host': host});
    }

    function start(callback) {
        obj.logger.info({message: 'Server initialized.', name: setup.name});
        _createServer(callback);
    }

    function stop(callback) {
        if(typeof callback !== 'function') {
            callback = _.noop;
        }
        if (server === null) {
            obj.logger.warn({
                message: 'Skipping, server already closed.'
            });
            callback();
            return;
        }
        server.close(function(err) {
            obj.logger.info({message: 'Server closed.'});
            server = null;
        });
        callback();
    }

    obj.modifyHeaders = modifyHeaders;
    obj.start = start;
    obj.stop = stop;
    obj.writeResponse = writeResponse;
    obj.addRoutes = addRoutes;
    return obj;
};
