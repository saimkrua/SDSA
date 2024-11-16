var amqp = require("amqplib/callback_api");
const { connectToMongo } = require("./db");

connectToMongo()
  .then(({ client, ordersCollection }) => {
    amqp.connect(
      process.env.AMQP_URL || "amqp://localhost",
      function (error0, connection) {
        if (error0) {
          throw error0;
        }

        console.log(" [*] Successfully connected to RabbitMQ");

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

                  // Save order to MongoDB
                  ordersCollection.insertOne(order, function (err, result) {
                    if (err) {
                      console.error("Failed to save order to MongoDB:", err);
                    } else {
                      console.log(
                        " [*] Order saved to MongoDB:",
                        result.insertedId
                      );
                    }
                  });

                  setTimeout(function () {
                    channel.ack(msg);
                  }, order.quantity * 1000); // Simulating processing time
                },
                {
                  noAck: false,
                }
              );
            }
          );
        });
      }
    );
  })
  .catch((err) => {
    console.error("Error initializing application:", err);
    process.exit(1);
  });
