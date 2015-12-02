var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var http = require('http');
var request = require('request');

var simpleHttp = require(path.join(__dirname, '../http/simple-http.js'));

describe('Simple http server - configuration ...', function() {
    it('should be created', function() {
        var server = simpleHttp({
            name: 'test - server'
        });
        expect(server.addRoutes).to.be.a('function');
        expect(server.writeResponse).to.be.a('function');
        expect(server.start).to.be.a('function');
        expect(server.stop).to.be.a('function');
    });

    it('should be started', function(done) {
        var server = simpleHttp({
            name: 'test - server',
            logLevel: 'off'
        });
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

        var serverA = simpleHttp({
            name: 'test - server A',
            logLevel: 'off'
        });
        var serverB = simpleHttp({
            name: 'test - server B',
            logLevel: 'off',
            error: errorSpy
        });

        serverA.start(listenSpyA);
    });

});


describe('Simple http server - response...', function() {
    beforeEach(function(done) {
        this.server = simpleHttp({
            name: 'test - server A',
            logLevel: 'off'
        });
        this.server.start(function() {
            done();
        });
    });

    afterEach(function(done) {
        this.server.stop(function() {
            done();
        });
    });

    it('should allow for setting default headers', function(done) {
        this.server.modifyHeaders({
            'fake-header': 'fake/type'
        });

        request({
            url: 'http://localhost:7000/fakeRoute'
        }, function(err, response, body) {
            expect(response.headers['fake-header']).to.equals('fake/type');
            done();
        });
    });

    it('should set default content type', function(done) {
        request({
            url: 'http://localhost:7000/fakeRoute'
        }, function(err, response, body) {
            expect(response.headers['content-type']).to.equals('text/html');
            done();
        });
    });

    it('should fire default route without custom ones', function(done) {
        request({
            url: 'http://localhost:7000/fakeRoute'
        }, function(err, response, body) {
            expect(body).to.contain('Default Router.');
            expect(body).to.contain('not supported');
            expect(response.statusCode).to.equals(404);
            done();
        });

    });

    it('should allow for adding new routes', function(done) {
        this.server.addRoutes({
            getFakeRoute: function(request, response) {
                this.server.writeResponse(response, 200, 'OK');
                response.end();
            }.bind(this)
        });
        request({
            url: 'http://localhost:7000/fakeRoute'
        }, function(err, response, body) {
            expect(body).to.equal('OK');
            expect(response.statusCode).to.equals(200);
            expect(response.headers['content-type']).to.equal('text/html');
            done();
        });
    });

    it('should allow for overwriting headers in routes', function(done) {
        this.server.addRoutes({
            getFakeRoute: function(request, response) {
                this.server.writeResponse(response, 200, 'OK', {
                    'content-type': 'fake'
                });
                response.end();
            }.bind(this)
        });
        request({
            url: 'http://localhost:7000/fakeRoute'
        }, function(err, response, body) {
            expect(body).to.equal('OK');
            expect(response.statusCode).to.equals(200);
            expect(response.headers['content-type']).to.equal('fake');
            done();
        });
    });

});
