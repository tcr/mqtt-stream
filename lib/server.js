/**
 * Requires
 */

var events = require('events')
  , util = require('util')
  , Connection = require('./connection');

/**
 * MqttServer
 *
 * @param {Function} listener - fired on client connection
 */
var MqttServer = module.exports.MqttServer = 
function Server (listener) {
  if (!(this instanceof Server)) return new Server(listener);

  this.clients = [];

  if (listener) {
    this.on('client', listener);
  }
}
util.inherits(MqttServer, events.EventEmitter);

MqttServer.prototype._write = function (chunk, encoding, callback) {
  callback(null);
};

/**
 * MqttSecureServer
 *
 * @param {String} privateKeyPath
 * @param {String} publicCertPath
 * @param {Function} listener
 */
MqttServer.prototype.createClient = function () {
  var self = this
    , client = new Connection(this);

  self.clients.push(client);
  client.on('close', function () {
    if (self.clients.indexOf(this)) {
      self.clients.splice(self.clients.indexOf(this), 1);
    }
  });

  // socket.on('error', client.emit.bind(client, 'error'));
  // socket.on('close', client.emit.bind(client, 'close'));
  
  self.emit('client', client);

  return client;
}
