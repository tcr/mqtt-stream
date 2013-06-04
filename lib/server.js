/**
 * Requires
 */

var Duplex = require('stream').Duplex
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

  this.on('pipe', this._addConnection.bind(this));
}
util.inherits(MqttServer, Duplex);

this._write = function () { }

/**
 * MqttSecureServer
 *
 * @param {String} privateKeyPath
 * @param {String} publicCertPath
 * @param {Function} listener
 */
MqttServer.prototype._addConnection = function (socket) {
  var self = this
    , client = new MqttServerClient(socket, this);

  self.clients.push(client);
  client.on('close', function () {
    if (self.clients.indexOf(this)) {
      self.clients.splice(self.clients.indexOf(this), 1);
    }
  });

  self.emit('client', client);

  return self;
}

/**
 * MqttServerClient - wrapper around Connection
 * Exists if we want to extend server functionality later
 *
 * @param {Stream} stream
 * @param {MqttServer} server
 */

var MqttServerClient = module.exports.MqttServerClient =
function MqttServerClient(stream, server) {
  Connection.call(this, stream, server);
  // this.stream.on('error', this.emit.bind(this, 'error'));
  // this.stream.on('close', this.emit.bind(this, 'close'));

  var e = this.emit;
  this.emit = function () {
    console.log('EMIT', arguments);
    if (arguments[0] == 'error') {
      throw new Error();
    }
    return e.apply(this, arguments);
  }
};
util.inherits(MqttServerClient, Connection);
