var amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    var exchange = "order_queue";
    var routingKey = "order_routing_key";

    channel.assertExchange(exchange, "direct", {
      durable: true,
    });

    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      function (error2, q) {
        if (error2) {
          throw error2;
        }

        console.log(" [*] Waiting for orders. To exit press CTRL+C");

        channel.bindQueue(q.queue, exchange, routingKey);

        channel.consume(
          q.queue,
          function (msg) {
            var order = JSON.parse(msg.content.toString());
            console.log(" [x] Received order:", order);

            var processingTime = order.quantity * 1000;
            setTimeout(function () {
              channel.ack(msg);
            }, processingTime);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});
