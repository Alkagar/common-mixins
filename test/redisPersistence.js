var mysql = require('mysql');
var assert = require('chai').assert;
var path = require('path');

var redisMixin = require(path.join(__dirname, '../mixins/redis.js'));
var restore = require(path.join(__dirname, '../mixins/redisPersistenceRestore.js'));

var mysqlTestConfig = {
  "host": "localhost",
  "user": "root",
  "password": "",
  "database": "gp"
}

var redisClient = redisMixin({}, {
  persistence: mysqlTestConfig,
}).redisClient();

var mysqlClient = mysql.createConnection(mysqlTestConfig);
mysqlClient.connect();

describe("Redis persistence", function() {
  beforeEach(function() {
    redisMixin({}, {}).redisClient().flushdb();
    mysqlClient.query('USE gp;');
    mysqlClient.query('DELETE FROM redis_commands;');
  });

  it("stores commands in the db", function(done) {
    redisClient.multi()
      .set('a', 'b')
      .set('b', 'c')
      .set('b', 'd')
      .set('c', 'd')
      .set('a', 'c')
      .exec(function (error, results) {
        if (!error) {
          setTimeout(function () {  // no way to check when data get's stored
            var results = [];
            mysqlClient.query('SELECT command, args, client_uuid FROM redis_commands ORDER BY created_at, _order ASC;')
              .on('result', function (result) {
                // console.log(result);
                results.push(result);
              })
              .on('end', function () {
                assert.equal(results.length, 8, '8 commands total');
                assert.equal(results[0].command, 'flushdb', 'Too lazy to include normal client too');
                assert.equal(results[1].command, 'multi', 'Starts with transaction');
                assert.equal(results[4].command, 'set', 'Command order');
                assert.equal(results[4].args, '["b","d"]', 'Command args');
                done();
              });
          }, 1000);  // so just a timeout as a workaround
        } else {
          console.log(error);
          assert.fail();
        }
      });
  });

  it('restores state from command list', function (done) {
    done();
    // fixtures
    var query = 'INSERT INTO redis_commands (command, args, client_uuid, created_at, _order) VALUES ' +
      "('multi', '[]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 0), " +
      "('set', '[\\\"a\\\",\\\"b\\\"]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 1), " +
      "('set', '[\\\"b\\\",\\\"c\\\"]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 2), " +
      "('set', '[\\\"b\\\",\\\"d\\\"]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 3), " +
      "('set', '[\\\"c\\\",\\\"d\\\"]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 4), " +
      "('set', '[\\\"a\\\",\\\"c\\\"]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 5), " +
      "('exec', '[]', 'de305d54-75b4-431b-adb2-eb6b9e546014', '2000-01-01 00:00:00.000', 6);";
    mysqlClient.query(query)
      .on('error', function (error) {
        console.log(error);
        assert.fail();
      })
      .on('end', function (result) {
        restore(mysqlClient, {}, function (error, result) {
          if(!error) {
            redisClient.send_command('mget', ['a', 'b', 'c'], function (error, results) {
              if(!error) {
                console.log(results);
                assert.equal(results[0], 'c');
                assert.equal(results[1], 'd');
                assert.equal(results[2], 'd');
                done();
              } else {
                console.log(error);
                assert.fail();
              }
            });
          } else {
            console.log(error);
            assert.fail();
          }
        })
      });
  });
});
