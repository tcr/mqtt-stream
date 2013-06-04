/* 
 * Copyright (c) 2011 Adam Rudd. 
 * See LICENSE for more information 
 */

var net = require('net')
  , MqttServer = require('./server').MqttServer
  , MqttSecureServer = require('./server').MqttSecureServer
  , MqttClient = require('./client')
  , MqttConnection = require('./connection')
  , tls = require("tls")
  , fs = require("fs");

/**
 * createClient - create an MQTT client
 *
 * @param {Number} [port] - broker port
 * @param {String} [host] - broker host
 * @param {Object} [opts] - see MqttClient#constructor
 * @api public
 */
module.exports.createClient = function (stream, opts) {
  return new MqttClient(stream, opts);
};

/**
 * createServer - create an MQTT server
 *
 * @param {Function} listener - called on new client connections
 */

module.exports.createServer = function(listener) {
  return new MqttServer(listener);
};

// Expose MqttClient
module.exports.MqttClient = MqttClient;

// Expose servers
module.exports.MqttServer = MqttServer;
