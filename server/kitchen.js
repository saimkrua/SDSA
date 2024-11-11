#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'order_queue';
    var queue = ''; // Server will assign a unique queue name
    var bindingKey = process.argv.slice(2);

    // Declare the exchange
    channel.assertExchange(exchange, 'topic', {
      durable: true
    });

    // Declare a queue (server-named)
    channel.assertQueue(queue, {
      exclusive: true // This queue is exclusive to this consumer <---***duration
    }, function (error2, q) {
      if (error2) {
        throw error2;
      }

      console.log(" [*] Waiting for orders of type: %s. To exit press CTRL+C", bindingKey);

      // Bind the queue to the exchange with the specified routing key (bindingKey)
      if (!bindingKey || bindingKey.length === 0) {
        channel.bindQueue(q.queue, exchange, 'food.*.*');
      } else {
        bindingKey.forEach((key) => {
          channel.bindQueue(q.queue, exchange, key);
        });
      }

      // Consume messages from the queue
      channel.consume(q.queue, function (msg) {
        var order = JSON.parse(msg.content.toString());
        console.log(" [x] Received order:", order);

        // Simulate order processing
        var processingTime = order.quantity * 1000; // e.g., 1 second per item
        setTimeout(function () {
          console.log(" [x] Done processing order:", order);
          channel.ack(msg); // Acknowledge the message
        }, processingTime);
      }, {
        noAck: false // Require acknowledgement
      });
    });
  });
});  
