var redisMixin = require('../mixins/redis');


var _redisClients = {};
var getRedisClient = function (uuid, redisConfig) {
  // assert(!_.includes(redisConfig, 'persistence'));  // don't ever persist restoration process
  if (!_redisClients[uuid]) {
      _redisClients[uuid] = redisMixin({}, redisConfig).redisClient();
  }
  return _redisClients[uuid];
}

var restore = function (mysqlClient, redisConfig, callback) {
  mysqlClient.query('USE gp;');
  sql = 'SELECT command, args, client_uuid FROM redis_commands ORDER BY created_at, _order ASC;';
  var count = 0;
  mysqlClient.query(sql)
    .on('error', function (error) {
      callback(error, count);
    })
    .on('result', function (row) {
      var _count = count ++;
      var _uuid = row.client_uuid;
      var _command = row.command;
      var _args = JSON.parse(row.args);
      console.log('sending', row.command);
      getRedisClient(row.client_uuid, redisConfig).send_command(row.command, JSON.parse(row.args), function (err, result) {
        if (err) {
          console.log(_count, _uuid, _command, _args, err);  // not using logger, restore is a manual script
        }
      });
    })
    .on('end', function () {
      if (typeof callback == 'function') {
        callback(null, count);
      }
    });
}


module.exports = restore;
