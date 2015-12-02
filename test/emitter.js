var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');


var emitter = require(path.join(__dirname, '../mixins/emitter.js'));

describe('Emitter ...', function() {
    beforeEach(function() {});

    afterEach(function() {});

    it('should extend object with emitter object', function() {
        var obj = emitter({});
        expect(obj.emitter).to.be.an('object');
        expect(obj.emitter.on).to.be.a('function');
        expect(obj.emitter.emit).to.be.a('function');
    });

    it('should emit event correctly', function(done) {
        var obj = emitter({});
        var spy = sinon.spy(function(data) {
            expect(spy.called).to.be.equal(true);
            expect(data).to.be.equal('fakeData');
            done();
        });
        obj.emitter.on('fakeEvent', spy);
        obj.emitter.emit('fakeEvent', 'fakeData');
    });
});
