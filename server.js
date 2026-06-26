const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const config = require("./config");
const portas = require("./portas");
const produtos = require("./produtos");
const { criarPix, consultarPagamento } = require("./mercadopago");
const { consultarESP32 } = require("./esp32");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Servidor VENDIBOX SMART PIX 2.0 funcionando!");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

app.get("/portas", (req, res) => {
  Object.keys(produtos).forEach((id) => {
    if (portas[id]) {
      portas[id].produto.nome = produtos[id].nome;
      portas[id].produto.preco = produtos[id].valor;
    }
  });

  res.json(portas);
});

app.get("/pagar/:porta", async (req, res) => {
  try {
    const porta = req.params.porta;
    const produto = produtos[porta];

    if (!produto) {
      return res.status(404).send("Porta não cadastrada");
    }

    const pix = await criarPix({
      porta,
      produto: produto.nome,
      valor: produto.valor
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>VENDIBOX - Porta ${porta}</title>
        <style>
          body {
            background:#050b14;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:30px;
          }
          .box {
            max-width:420px;
            margin:auto;
            border:1px solid #00d9ff;
            border-radius:16px;
            padding:25px;
            box-shadow:0 0 20px #00d9ff55;
          }
          h1 { color:#00d9ff; }
          img { width:260px; background:white; padding:10px; border-radius:12px; }
          textarea {
            width:100%;
            height:120px;
            margin-top:15px;
            border-radius:10px;
            padding:10px;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>VENDIBOX SMART PIX</h1>
          <h2>Porta ${porta}</h2>
          <h3>${produto.nome}</h3>
          <h2>R$ ${produto.valor.toFixed(2)}</h2>

          <p>Escaneie o QR Code PIX abaixo:</p>

          <img src="data:image/png;base64,${pix.qrCodeBase64}" />

          <p>Ou copie o código PIX:</p>

          <textarea readonly>${pix.qrCode}</textarea>

          <p>Após o pagamento aprovado, a porta será liberada automaticamente.</p>
        </div>
      </body>
      </html>
    `);

  } catch (erro) {
    console.log(erro);
    res.status(500).send("Erro ao gerar PIX: " + erro.message);
  }
});

app.post("/webhook-pix", async (req, res) => {
  try {
    console.log("Webhook recebido:", req.body);

    const paymentId = req.body?.data?.id || req.query.id;

    if (!paymentId) {
      return res.status(200).json({ recebido: true });
    }

    const pagamento = await consultarPagamento(paymentId);

    if (pagamento.status === "approved") {
      const referencia = pagamento.external_reference;

      if (referencia && referencia.startsWith("PORTA_")) {
        const porta = referencia.replace("PORTA_", "");

        if (portas[porta]) {
          portas[porta].aberta = true;
          console.log(`Pagamento aprovado. Porta ${porta} liberada.`);
        }
      }
    }

    res.status(200).json({ recebido: true });

  } catch (erro) {
    console.log("Erro no webhook:", erro.message);
    res.status(200).json({ recebido: true, erro: erro.message });
  }
});

app.get("/esp32", consultarESP32);

app.get("/liberar/:porta", (req, res) => {
  const token = req.query.token;
  const porta = req.params.porta;

  if (token !== config.esp32Token) {
    return res.status(403).send("Token inválido");
  }

  if (!portas[porta]) {
    return res.status(404).send("Porta inexistente");
  }

  portas[porta].aberta = true;

  res.send(`Porta ${porta} liberada manualmente`);
});

app.listen(config.port, () => {
  console.log("VENDIBOX SMART PIX 2.0 iniciado");
});
