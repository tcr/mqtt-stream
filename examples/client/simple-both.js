var mqtt = require('../..')
  , net = require('net');


var client = mqtt.createClient();

var tcpclient = net.connect(4444);
tcpclient.on('connect', function () {
  tcpclient.pipe(client).pipe(tcpclient);

  client.connect();
  client.subscribe('news');
  client.publish('news', 'This is a message');
  client.on('message', function (topic, message) {
    console.log('Received message:', topic, message);
    console.log('Closing.');
    client.end();
  });
});