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

  this.clients = {};

  if (listener) {
    this.on('client', listener);
  }
}
util.inherits(MqttServer, events.EventEmitter);

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

  // When clients connect, add them to the server roster.
  client.on('connect', function (packet) {
    client.connack({
      returnCode: 0
    });
    client.id = packet.clientId;
    self.clients[client.id] = client;
  });

  // When clients close, remove them from the server roster.
  client.on('close', function (err) {
    delete self.clients[client.id];
  });

  client.on('publish', function (packet) {
    for (var k in self.clients) {
      self.clients[k].publish({
        topic: packet.topic,
        payload: packet.payload
      });
    }
  });

  client.on('subscribe', function (packet) {
    var granted = [];
    for (var i = 0; i < packet.subscriptions.length; i++) {
      granted.push(packet.subscriptions[i].qos);
    }

    client.suback({
      granted: granted,
      messageId: packet.messageId
    });
  });

  // Respond to ping requests.
  client.on('pingreq', function (packet) {
    client.pingresp();
  });

  // When clients disconnect, end their attachment to ther server.
  client.on('disconnect', function (packet) {
    client.end();
  });

  client.on('error', function (err) {
    console.log('error!', arguments);
  });

  // Emit server event.
  self.emit('client', client);

  return client;
}
