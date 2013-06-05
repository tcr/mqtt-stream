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
    , client = new Connection(this);

  self.clients.push(client);
  client.on('close', function () {
    if (self.clients.indexOf(this)) {
      self.clients.splice(self.clients.indexOf(this), 1);
    }
  });

  socket.on('error', client.emit.bind(client, 'error'));
  socket.on('close', client.emit.bind(client, 'close'));

  socket.pipe(client).pipe(socket);
  
  self.emit('client', client);

  return self;
}
