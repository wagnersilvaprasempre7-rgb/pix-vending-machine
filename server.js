const express = require("express");
const app = express();

app.use(express.json());

let liberarTrava = false;

app.get("/", (req, res) => {
  res.send("Servidor da Vending Machine funcionando!");
});

app.post("/webhook-pix", (req, res) => {
  liberarTrava = true;
  res.status(200).send("PIX recebido");
});

app.get("/esp32", (req, res) => {

  const token = req.query.token;

  if(token !== process.env.ESP32_TOKEN){
    return res.status(403).send("Token inválido");
  }

  if(liberarTrava){
    liberarTrava = false;
    return res.json({
      abrir:true
    });
  }

  res.json({
    abrir:false
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Servidor iniciado");
});
