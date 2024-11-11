const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  client.getAllMenu(null, (err, data) => {
    if (!err) {
      res.render("menu", {
        results: data.menu,
      });
    }
  });
});

var amqp = require("amqplib/callback_api");

app.post("/placeorder", (req, res) => {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  amqp.connect(
    process.env.RABBITMQ_URL || "amqp://localhost",
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        var exchange = "order_queue";
        var routingKey = "order_routing_key"; // Specify the routing key for the direct queue

        // Declare a direct exchange
        channel.assertExchange(exchange, "direct", {
          durable: true,
        });

        // Publish the order with the appropriate routing key
        channel.publish(
          exchange,
          routingKey,
          Buffer.from(JSON.stringify(orderItem)),
          {
            persistent: true,
          }
        );

        console.log(" [x] Sent '%s'", JSON.stringify(orderItem));
      });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
