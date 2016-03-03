var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

var redis = require(path.join(__dirname, '../mixins/redis.js'));

describe('Redis ...', function() {
    beforeEach(function() {

    });

    afterEach(function() {

    });

    it('should allow to extend any object', function() {
        var obj = redis({}, {
            logger: {
                level: 'off'
            }
        });
        expect(typeof obj.redisClient).to.equals('function');
        obj.clearClient();
    });
    it('should always return the same connection', function() {
        var objA = redis({}, {
            logger: {
                level: 'off'
            }
        });
        var objB = redis({}, {
            logger: {
                level: 'off'
            }
        });

        expect(objA.redisClient()).to.equals(objB.redisClient());
        objA.clearClient();
    });
    it('should create two connection for publisher and subsciber', function() {
        var objA = redis({}, {
            logger: {
                level: 'off'
            }
        });
        var objB = redis({}, {
            logger: {
                level: 'off',
            },
            type: 'subscriber'
        });
        var objC = redis({}, {
            logger: {
                level: 'off',
            },
            type: 'subscriber'
        });

        expect(objA.redisClient()).not.to.equals(objB.redisClient('subscriber'));
        expect(objC.redisClient('subscriber')).to.equals(objB.redisClient('subscriber'));
        objA.clearClient();
        objB.clearClient('subscriber');
    });
    it('should create publisher by default', function() {
        var objA = redis({}, {
            logger: {
                level: 'off'
            }
        });
        expect(objA.redisClient('publisher')).to.be.an('object');
        expect(objA.redisClient('subscriber')).not.to.be.an('object');
        objA.clearClient();
    });

    it('should clear clients', function() {
        var objA = redis({}, {
            logger: {
                level: 'off'
            }
        });
        var objB = redis({}, {
            logger: {
                level: 'off'
            },
            type: 'subscriber'
        });

        expect(objA.redisClient('publisher')).to.be.an('object');
        expect(objA.redisClient('subscriber')).to.be.an('object');
        objA.clearClient();
        objB.clearClient('subscriber');
        expect(objA.redisClient('publisher')).not.to.be.an('object');
        expect(objA.redisClient('subscriber')).not.to.be.an('object');
    });

    it('should allow for batch create', function() {
        var objA = redis({}, {
            logger: {
                level: 'off'
            },
            type: 'publisher|subscriber'
        });

        expect(objA.redisClient('publisher')).to.be.an('object');
        expect(objA.redisClient('subscriber')).to.be.an('object');
        objA.clearClient();
        objA.clearClient('subscriber');
        expect(objA.redisClient('publisher')).not.to.be.an('object');
        expect(objA.redisClient('subscriber')).not.to.be.an('object');
    });

    it('should allow to include mysql persistence', function (done) {
      var objA = redis({}, {
          logger: {
              level: 'error'
          },
          type: 'publisher',
          persistence: {
            "host": "localhost",
            "user": "root",
            "password": "",
            "database": "gp"
          },
          onReady: done,
      });
    });
});
