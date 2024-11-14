const { createServer } = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib/callback_api");

const httpServer = createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
const orders = [];

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
});

io.on("get_orders", () => {
  io.emit("orders", orders);
});

io.on("delete_order", (oid) => {
  orders.filter((order) => order.oid !== oid);
  io.emit("order_deleted", oid);
});

amqp.connect(
  process.env.AMQP_URL || "amqp://rabbitmq-service",
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
              orders.push(order);
              io.emit("order_added", order);
              channel.ack(msg);
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

httpServer.listen(3000);
