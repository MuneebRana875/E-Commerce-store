const paypal = require("paypal-rest-sdk");

// Humne yahan direct values likh di hain taake .env ka masla hi khatam ho jaye
paypal.configure({
  mode: "sandbox", 
  client_id: "test_id", 
  client_secret: "test_secret",
});

module.exports = paypal;