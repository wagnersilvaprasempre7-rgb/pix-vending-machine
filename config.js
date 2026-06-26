const config = {
  port: process.env.PORT || 3000,

  esp32Token: process.env.ESP32_TOKEN,

  mercadoPagoAccessToken: process.env.MP_ACCESS_TOKEN,

  webhookSecret: process.env.MP_WEBHOOK_SECRET,

  baseUrl: process.env.BASE_URL || "https://pix-vending-machine.onrender.com"
};

module.exports = config;
