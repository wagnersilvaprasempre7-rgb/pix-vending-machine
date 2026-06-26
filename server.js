const express = require("express");
const cors = require("cors");

const config = require("./config");
const portas = require("./portas");
const { criarPix } = require("./mercadopago");
const { processarWebhook } = require("./webhook");
const { consultarESP32 } = require("./esp32");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor VENDIBOX SMART PIX 2.0 funcionando!");
});

app.get("/portas", (req, res) => {
  res.json(portas);
});

app.post("/pix", async (req, res) => {
  try {
    const { porta, produto, valor } = req.body;

    if (!porta || !produto || !valor) {
      return res.status(400).json({
        erro: "Informe porta, produto e valor"
      });
    }

    if (!portas[porta]) {
      return res.status(404).json({
        erro: "Porta inexistente"
      });
    }

    portas[porta].produto = {
      nome: produto,
      preco: Number(valor),
      estoque: 1
    };

    const pix = await criarPix({
      porta,
      produto,
      valor
    });

    res.json({
      sucesso: true,
      mensagem: "PIX criado com sucesso",
      pix
    });

  } catch (error) {
    console.error("Erro ao criar PIX:", error);

    res.status(500).json({
      erro: "Erro ao criar PIX",
      detalhes: error.message
    });
  }
});

app.post("/webhook-pix", processarWebhook);

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
  console.log(`Servidor VENDIBOX iniciado na porta ${config.port}`);
});
