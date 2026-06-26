const crypto = require("crypto");
const portas = require("./portas");
const config = require("./config");
const { consultarPagamento } = require("./mercadopago");

function validarAssinatura(req) {
  const secret = config.webhookSecret;

  if (!secret) return true;

  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];

  if (!signature || !requestId) {
    console.log("Webhook sem assinatura. Continuando para teste.");
    return true;
  }

  const dataId = req.body?.data?.id;

  if (!dataId) return true;

  const parts = signature.split(",");

  let ts = "";
  let hash = "";

  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      if (key.trim() === "ts") ts = value.trim();
      if (key.trim() === "v1") hash = value.trim();
    }
  });

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return hmac === hash;
}

async function processarWebhook(req, res) {
  try {
    console.log("Webhook recebido:", req.body);

    const assinaturaValida = validarAssinatura(req);

    if (!assinaturaValida) {
      console.log("Assinatura inválida");
      return res.status(401).json({ erro: "Assinatura inválida" });
    }

    const paymentId = req.body?.data?.id || req.query.id;

    if (!paymentId) {
      return res.status(200).json({ recebido: true });
    }

    const pagamento = await consultarPagamento(paymentId);

    console.log("Status do pagamento:", pagamento.status);
    console.log("Referência:", pagamento.external_reference);

    if (pagamento.status === "approved") {
      const referencia = pagamento.external_reference;

      if (referencia && referencia.startsWith("PORTA_")) {
        const porta = referencia.replace("PORTA_", "");

        if (portas[porta]) {
          portas[porta].aberta = true;

          console.log(`Pagamento aprovado. Porta ${porta} liberada.`);

          return res.status(200).json({
            recebido: true,
            pagamento: pagamento.id,
            porta,
            liberada: true
          });
        }
      }
    }

    res.status(200).json({
      recebido: true,
      status: pagamento.status
    });

  } catch (erro) {
    console.log("Erro no webhook:", erro.message);

    res.status(200).json({
      recebido: true,
      erro: erro.message
    });
  }
}

module.exports = {
  processarWebhook
};
};
