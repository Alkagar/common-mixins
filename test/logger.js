var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

var logger = require(path.join(__dirname, '../mixins/logger.js'));


describe('Logger ...', function() {
    it('should be crated as property', function() {
        var log = {};
        logger(log, {
            name: 'logger'
        });

        expect(log.logger.info).to.be.a('function');
        expect(log.logger.warn).to.be.a('function');
        expect(log.logger.error).to.be.a('function');
        expect(log.logger.fatal).to.be.a('function');
        expect(log.logger.debug).to.be.a('function');
        expect(log.logger.trace).to.be.a('function');

        expect(log.info).to.be.equal(undefined);
        expect(log.warn).to.be.equal(undefined);
        expect(log.error).to.be.equal(undefined);
        expect(log.fatal).to.be.equal(undefined);
        expect(log.debug).to.be.equal(undefined);
        expect(log.trace).to.be.equal(undefined);

    });

    it('should be crated inline', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true
        });

        expect(log.info).to.be.a('function');
        expect(log.warn).to.be.a('function');
        expect(log.error).to.be.a('function');
        expect(log.fatal).to.be.a('function');
        expect(log.debug).to.be.a('function');
        expect(log.trace).to.be.a('function');

        expect(log.logger).to.be.equal(undefined);
    });

    it('should be able to silent itself', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'off'
        });

        expect(log.info('xxxx')).to.be.equal(false);
        expect(log.warn('xxxx')).to.be.equal(false);
        expect(log.error('xxxx')).to.be.equal(false);
        expect(log.fatal('xxxx')).to.be.equal(false);
        expect(log.debug('xxxx')).to.be.equal(false);
        expect(log.trace('xxxx')).to.be.equal(false);
    });

    it('should log on trace level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.trace('xxxx')).to.be.equal(true);
    });
    it('should log on debug level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.debug('xxxx')).to.be.equal(true);
    });
    it('should log on fatal level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.fatal('xxxx')).to.be.equal(true);
    });
    it('should log on error level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.error('xxxx')).to.be.equal(true);
    });
    it('should log on warn level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.warn('xxxx')).to.be.equal(true);
    });
    it('should log on info level', function() {
        var log = {};
        logger(log, {
            name: 'logger',
            direct: true,
            level: 'other'
        });

        expect(log.info('xxxx')).to.be.equal(true);
    });

});
