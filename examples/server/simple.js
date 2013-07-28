var mqtt = require('../..')
  , net = require('net');


var server = mqtt.createServer();

var tcpserver = net.createServer();
tcpserver.listen(4444);
tcpserver.on('connection', function (tcpclient) {
  // Pipe TCP client into server-tracked client.
  tcpclient.pipe(server.createClient()).pipe(tcpclient);

  console.log('MQTT client connected.');
});

console.log('MQTT Server started.');