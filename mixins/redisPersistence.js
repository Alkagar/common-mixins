var simpleLogger = require('./simple-logger');
var path = require('path');
var mysql = require('mysql');
var uuid = require('node-uuid');
var _ = require('lodash');
var moment = require('moment');

var logger = simpleLogger({}).logger;

// 'CREATE DATABASE IF NOT EXISTS gp;'
// 'CREATE TABLE IF NOT EXISTS redis_commands (command varchar(40) NOT NULL, args text, created_at timestamp NOT NULL, _order INT NOT NULL, client_uuid VARCHAR(36) NOT NULL);'  // MySQL 5.5 doesnt support fractional timestamps
// 'CREATE TABLE IF NOT EXISTS redis_commands (command varchar(40) NOT NULL, args text, created_at timestamp(3) NOT NULL, _order INT NOT NULL, client_uuid VARCHAR(36) NOT NULL);'  // MySQL 5.7 does support fractional timestamps
var createPersistenceClient = function (persistenceConfig) {
  var pool = mysql.createPool(persistenceConfig);
  logger.debug('MySQL connection pool created');

  var mysqlClient = {  // works just like normal client, but also manages connection from a pool
    query: function () {
      var queryArgs = Array.prototype.slice.call(arguments);
      var events = [];
      var eventNameIndex = {};

      pool.getConnection(function (err, conn) {
        if (err) {
          if (eventNameIndex.error) {
              eventNameIndex.error('Failed to get connection from pool: ' + err);
          }
        }
        if (conn) {
          var q = conn.query.apply(conn, queryArgs);
          q.on('end', function () {
              conn.release();
          });

          events.forEach(function (args) {
              q.on.apply(q, args);
          });
        }
      });

      return {
        on: function (eventName, callback) {
          events.push(Array.prototype.slice.call(arguments));
          eventNameIndex[eventName] = callback;
          return this;
        },
      };
    },
    format: mysql.format,
    end: function () {
        pool.end();
    },
  }

  return {
    storeCommand: function (command, args, order, clientUUID, timestamp) {
      var sql = 'INSERT INTO redis_commands (command, args, _order, client_uuid, created_at) VALUES (?, ?, ?, ?, ?);';
      var formattedSQL = mysqlClient.format(sql, [command, JSON.stringify(args), order, clientUUID, timestamp]);
      mysqlClient.query(formattedSQL)
        .on('error', function (error) {
          logger.fatal('Failed store: command ' + command + ' with arguments ' + args);
          logger.fatal(formattedSQL);
          logger.fatal(error);
        })
        .on('end', function (result) {
          logger.debug('Stored command ' + command + ' with args ' + JSON.stringify(args));
        });
    },
    end: function () {
      mysqlClient.end();
    }
  }
}

var computeModifyingCommands = function (redisClient) {
  redisClient.send_command('command', [], function (err, response) {
    var modifyingCommands = _.filter(response, function (e) {
      return _.includes(e[2], 'write');
    })
    .map(function (e) {
      return e[0];
    });
    // TODO figure out how to pass this outside of async context
    // console.log(modifyingCommands);
  });
}

var isModifying = function (command) {
  modifyingCommands = [  // manually pasted output of computeModifyingCommands
    'decr',
    'spop',
    'setex',
    'rpushx',
    'persist',
    'psetex',
    'zincrby',
    'expireat',
    'ltrim',
    'flushdb',
    'sort',
    'incr',
    'rpoplpush',
    'setnx',
    'pexpireat',
    'srem',
    'mset',
    'hsetnx',
    'bitop',
    'hmset',
    'zremrangebyscore',
    'lpushx',
    'set',
    'restore-asking',
    'hset',
    'move',
    'lpop',
    'blpop',
    'msetnx',
    'linsert',
    'zadd',
    'migrate',
    'brpoplpush',
    'zunionstore',
    'del',
    'hdel',
    'incrbyfloat',
    'hincrbyfloat',
    'pfmerge',
    'incrby',
    'zinterstore',
    'setbit',
    'hincrby',
    'lrem',
    'zremrangebyrank',
    'append',
    'rpop',
    'brpop',
    'sunionstore',
    'lpush',
    'expire',
    'zremrangebylex',
    'rpush',
    'sdiffstore',
    'setrange',
    'flushall',
    'sadd',
    'pexpire',
    'pfdebug',
    'renamenx',
    'sinterstore',
    'restore',
    'getset',
    'lset',
    'rename',
    'decrby',
    'zrem',
    'pfadd',
    'smove',
  ]

  return _.includes(modifyingCommands, command);
}

var isAlwaysStored = function(command) {
  var alwaysStore = [
    'multi',
    'exec',
    'watch',
    'discard',
  ]

  return _.includes(alwaysStore, command);
}

var addPersistence = function (redisClient, persistenceConfig) {
  var persistenceClient = createPersistenceClient(persistenceConfig);
  var counter = 0;
  var clientUUID = uuid.v4();
  logger.debug('Adding persistence to redis client');
  var wrappedSendCommand = redisClient.send_command;

  var newSendCommand = function(command, args, callback) {
    // handle convenience overloads, sometimes callback arrives inside args
    if(!callback && args.length > 0 && typeof args[args.length - 1] == "function") {
      callback = args[args.length - 1];
      args = args.slice(0, args.length - 1);
    }

    // redis client allows both uppercase and lowercase commands
    command = _.lowerCase(command);  // TODO figure out a better place for this

    var order = counter++;
    // var format = "YYYY-MM-DD HH:mm:ss.SSS";  // MySQL 5.7
    var format = "YYYY-MM-DD HH:mm:ss";  // MySQL 5.7
    var order = counter++;  // increments counter even if command doesn't get stored, which is unnecessary
    // var format = "YYYY-MM-DD HH:mm:ss.SSS";  // MySQL 5.7
    var format = "YYYY-MM-DD HH:mm:ss";  // MySQL 5.5
    var timestamp = moment.utc().format(format);  // bit optistic, too early
    wrappedSendCommand.call(redisClient, command, args, function (error, result) {
      // var timestamp = moment.utc().format("YYYY-MM-DD HH:mm:ss");  // but here it's already too late, possibly shuffled
      if(isAlwaysStored(command) || (!error && isModifying(command))) {
        persistenceClient.storeCommand(command, args, order, clientUUID, timestamp);
      }
      if (typeof callback == "function") {
        callback(error, result);
      }
    });
  }

  redisClient.send_command = newSendCommand;

  redisClient.on('end', function () {
    persistenceClient.end();
  })

  return redisClient;
}


module.exports = {
  addPersistence: addPersistence,
}
