const portas = require("./portas");
const config = require("./config");

function consultarESP32(req, res) {

    const token = req.query.token;
    const porta = req.query.porta;

    if(token !== config.esp32Token){

        return res.status(403).json({
            erro:"Token inválido"
        });

    }

    if(!porta){

        return res.status(400).json({
            erro:"Informe a porta"
        });

    }

    if(!portas[porta]){

        return res.status(404).json({
            erro:"Porta inexistente"
        });

    }

    if(portas[porta].aberta){

        portas[porta].aberta=false;

        return res.json({

            abrir:true,
            porta:porta,
            produto:portas[porta].produto

        });

    }

    res.json({

        abrir:false,
        porta:porta

    });

}

module.exports = {

    consultarESP32

};
