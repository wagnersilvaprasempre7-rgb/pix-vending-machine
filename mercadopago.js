const { MercadoPagoConfig, Payment } = require("mercadopago");
const config = require("./config");

const client = new MercadoPagoConfig({
  accessToken: config.mercadoPagoAccessToken
});

const payment = new Payment(client);

async function criarPix({ porta, produto, valor }) {
  const body = {
    transaction_amount: Number(valor),
    description: `VENDIBOX - Porta ${porta} - ${produto}`,
    payment_method_id: "pix",
    payer: {
      email: `cliente.porta${porta}@vendibox.com`
    },
    external_reference: `PORTA_${porta}`
  };

  const response = await payment.create({ body });

  return {
    idPagamento: response.id,
    porta,
    produto,
    valor,
    status: response.status,
    qrCode: response.point_of_interaction.transaction_data.qr_code,
    qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64
  };
}

module.exports = {
  criarPix
};
