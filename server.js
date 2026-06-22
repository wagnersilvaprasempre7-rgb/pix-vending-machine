const express = require("express");
const app = express();

app.use(express.json());

const portasLiberadas = {};

app.get("/", (req, res) => {
  res.send("Servidor da VENDIBOX funcionando!");
});

// Webhook do Mercado Pago
app.post("/webhook-pix", (req, res) => {
  console.log("Webhook recebido:", req.body);

  /*
    Por enquanto, para teste:
    Se chegar qualquer webhook, libera a porta informada na URL.
    Exemplo:
    /webhook-pix?porta=1
  */

  const porta = req.query.porta || "1";

  portasLiberadas[porta] = true;

  console.log(`Porta ${porta} liberada`);

  res.status(200).send("PIX recebido");
});

// ESP32 consulta se tem porta para abrir
app.get("/esp32", (req, res) => {
  const token = req.query.token;
  const porta = req.query.porta;

  if (token !== process.env.ESP32_TOKEN) {
    return res.status(403).send("Token inválido");
  }

  if (!porta) {
    return res.status(400).json({
      erro: "Informe a porta"
    });
  }

  if (portasLiberadas[porta]) {
    portasLiberadas[porta] = false;

    return res.json({
      abrir: true,
      porta: porta
    });
  }

  res.json({
    abrir: false,
    porta: porta
  });
});

// Painel simples para teste manual
app.get("/liberar/:porta", (req, res) => {
  const token = req.query.token;
  const porta = req.params.porta;

  if (token !== process.env.ESP32_TOKEN) {
    return res.status(403).send("Token inválido");
  }

  portasLiberadas[porta] = true;

  res.send(`Porta ${porta} liberada manualmente`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor VENDIBOX iniciado");
});
