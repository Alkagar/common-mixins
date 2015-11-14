var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');

var simpleHttp = require(path.join(__dirname, '../http/simple-http.js'));

describe('Simple http server ...', function() {
    it('should be created', function() {
        var server = simpleHttp({name: 'test - server'});
        expect(server.addRoutes).to.be.a('function');
        expect(server.writeResponse).to.be.a('function');
        expect(server.start).to.be.a('function');
        expect(server.stop).to.be.a('function');
    });

    it('should be started', function(done) {
        var server = simpleHttp({name: 'test - server', logLevel: 'off'});
        var listenSpy = sinon.spy(function() {
            expect(listenSpy.called).to.be.equal(true);
            server.stop();
            done();
        });
        server.start(listenSpy);
    });

    it('should error with EADDRINUSE', function(done) {
        var errorSpy = sinon.spy(function(err) {
            expect(err).to.be.an('error');
            expect(err.code).to.be.equal('EADDRINUSE');
            expect(listenSpyB.called).to.be.equal(false);
            serverB.stop();
            serverA.stop();
            done();
        });
        var listenSpyA = sinon.spy(function() {
            expect(listenSpyA.called).to.be.equal(true);
            serverB.start(listenSpyB);
        });
        var listenSpyB = sinon.spy();

        var serverA = simpleHttp({name: 'test - server A', logLevel: 'off'});
        var serverB = simpleHttp({name: 'test - server B', logLevel: 'off', error: errorSpy});

        serverA.start(listenSpyA);
    });

});
