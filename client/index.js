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

const foodCategories = {
  thai: [
    "Tomyam Gung",
    "Somtam",
    "Pad-Thai",
    "Fried rice",
    "Kraprao",
    "Kai-Jiew",
  ],
  japanese: ["Sukiyaki"],
  general: ["Fried egg", "Fried chicken"],
};

app.post("/placeorder", (req, res) => {
  //const updateMenuItem = {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
  };

  // Logic to determine the food type
  let foundType = "unknown"; // Default to unknown
  for (const [type, items] of Object.entries(foodCategories)) {
    if (items.includes(orderItem.name)) {
      foundType = type; // Set to the matching food type
      break; // Exit the loop once found
    }
  }

  orderItem.foodType = foundType;

  // Send the order msg to RabbitMQ
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      var exchange = "order_queue";
      var routingKey = `food.${orderItem.foodType.toLowerCase()}.${orderItem.name
        .toLowerCase()
        .replace(" ", "-")}`;

      // Declare a topic exchange
      channel.assertExchange(exchange, "topic", {
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

      console.log(" [x] Sent '%s' with key '%s'", orderItem, routingKey);
    });
  });
});
//console.log("update Item %s %s %d",updateMenuItem.id, req.body.name, req.body.quantity);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});

//var data = [{
//   name: '********',
//   company: 'JP Morgan',
//   designation: 'Senior Application Engineer'
//}];
