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
    } else {
      res.status(500).send("Failed to get menu");
    }
  });
});

app.get("/health-check", (req, res) => {
  console.log("Health check request received");
  res.status(200).send("OK");
});

var amqp = require("amqplib/callback_api");

app.post("/placeorder", (req, res) => {
  client.get({ id: req.body.id }, (err, data) => {
    if (err) {
      res.status(404).send("Failed to get menu item");
      return res.redirect("/");
    }

    console.log("Menu item found: ", data);

    const orderItem = {
      id: req.body.id,
      name: data.name,
      quantity: req.body.quantity,
    };

    amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost",
      function (error0, connection) {
        if (error0) {
          console.error("Failed to connect to RabbitMQ", error0);
          return res.status(500).send("Failed to connect to RabbitMQ");
        }

        connection.createChannel(function (error1, channel) {
          if (error1) {
            console.error("Failed to create channel", error1);
            return res.status(500).send("Failed to create channel");
          }

          const exchange = "order_queue";
          const routingKey = "order_routing_key";

          channel.assertExchange(exchange, "direct", { durable: true });

          channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(orderItem)),
            { persistent: true }
          );

          console.log(" [x] Sent '%s'", JSON.stringify(orderItem));

          // Close the connection after publishing
          setTimeout(() => {
            connection.close();
            res.redirect("/"); // Redirect to homepage after sending the message
          }, 500);
        });
      }
    );
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
