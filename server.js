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

// Permite carregar HTML, CSS, JS e imagens da pasta public
app.use(express.static("public"));

// Página inicial
app.get("/", (req, res) => {
    res.send("Servidor VENDIBOX SMART PIX 2.0 funcionando!");
});

// Painel administrativo
app.get("/admin", (req, res) => {
    res.sendFile(__dirname + "/public/admin.html");
});

// Lista todas as portas
app.get("/portas", (req, res) => {
    res.json(portas);
});

// Criar PIX
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
            pix

        });

    } catch (erro) {

        console.log(erro);

        res.status(500).json({

            erro: erro.message

        });

    }

});

// Webhook Mercado Pago
app.post("/webhook-pix", processarWebhook);

// Comunicação ESP32
app.get("/esp32", consultarESP32);

// Liberação manual
app.get("/liberar/:porta", (req, res) => {

    const token = req.query.token;

    if (token !== config.esp32Token) {

        return res.status(403).send("Token inválido");

    }

    const porta = req.params.porta;

    if (!portas[porta]) {

        return res.status(404).send("Porta inexistente");

    }

    portas[porta].aberta = true;

    res.send(`Porta ${porta} liberada manualmente`);

});

app.listen(config.port, () => {

    console.log("=========================================");
    console.log(" VENDIBOX SMART PIX 2.0");
    console.log(" Servidor iniciado com sucesso!");
    console.log(" Porta:", config.port);
    console.log("=========================================");

});
