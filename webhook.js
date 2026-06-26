const portas = require("./portas");

function processarWebhook(req, res) {
  console.log("Webhook Mercado Pago recebido:");
  console.log(req.body);

  const body = req.body;

  const externalReference =
    body.external_reference ||
    body.externalReference ||
    body?.data?.external_reference;

  let porta = null;

  if (externalReference && externalReference.startsWith("PORTA_")) {
    porta = externalReference.replace("PORTA_", "");
  }

  if (!porta && req.query.porta) {
    porta = req.query.porta;
  }

  if (porta && portas[porta]) {
    portas[porta].aberta = true;
    console.log(`Porta ${porta} liberada pelo webhook`);
  }

  res.status(200).json({
    recebido: true,
    porta: porta || null
  });
}

module.exports = {
  processarWebhook
};
