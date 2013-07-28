/**
 * mqtt-stream/connection.js
 // WHAT IS THIS
 */

 var Duplex = require('stream').Duplex
  , util = require('util')
  , protocol = require('./protocol')
  , generate = require('./protocol/generate')
  , parse = require('./protocol/parse');

var Connection = module.exports = 
function Connection(server) {
  this.server = server;

  this.buffer = null;
  this.packet = {};
  this.skip = false;
  var that = this;

  // Subscriptions
  this.subs = [];

  // Wrap incoming writes as a readable stream.
  this.in = new (require('stream').Readable)();
  this.in._read = function () { };
  this.in.on('readable', function () {
    if (!that.skip) {
      that.parse();
    }
    that.skip = false;
  });

  Duplex.call(this);
};
util.inherits(Connection, Duplex);

Connection.prototype._write = function (chunk, encoding, callback) {
  callback(this.in.push(chunk, encoding) == null);
};
Connection.prototype._read = function () { }

Connection.prototype.parse = function() {
  var byte = null, bytes = [], result;
  
  // Fresh packet - parse the header
  if (!this.packet.cmd) {
    byte = this.in.read(1);
    if (byte === null) {
      return;
    }
    parse.header(byte, this.packet);
  }

  if (!this.packet.length) {
    var tmp = {mul: 1, length: 0};
    byte = this.in.read(1);

    if (byte === null) {
      return;
    }

    bytes.push(byte);
    var pos = 1;

    while (pos++ < 4) {

      tmp.length += 
        tmp.mul * (byte[0] & protocol.LENGTH_MASK);
      tmp.mul *= 0x80;

      if ((byte[0] & protocol.LENGTH_FIN_MASK) === 0) {
        break;
      }

      byte = this.in.read(1);
      if(byte === null) {
        this.skip = true;
        this.in.unshift(Buffer.concat(bytes));
        return;
      }
      bytes.push(byte);
    }

    this.packet.length = tmp.length;
  }

  // Do we have a payload?
  if (this.packet.length > 0) {
    var payload = this.in.read(this.packet.length);

    // Do we have enough data to complete the payload?
    if (payload === null) {
      // Nope, wait for more data 
      return;
    }
  }

  // Finally we can parse the payload
  result = parse[this.packet.cmd](
    payload,
    this.packet
  );

  // Emit packet or error
  if (result instanceof Error) {
    this.emit("error", result);
  } else {
    this.emit(this.packet.cmd, result);
  }

  this.packet = {};

  // there might be one more message
  // to parse.
  this.parse();
};

for (var k in protocol.types) {
  var v = protocol.types[k];
  Connection.prototype[v] = function(type) {
    return function(opts) {
      var p = generate[type](opts);
      if (p instanceof Error) {
        this.emit('error', p)
      } else {
        this.push(p);
      }
    }
  }(v);
}