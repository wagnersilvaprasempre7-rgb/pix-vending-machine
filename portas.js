// portas.js

class Porta {

    constructor(id){

        this.id = id;
        this.aberta = false;
        this.ocupada = true;

        this.produto = {
            nome:"",
            preco:0,
            estoque:1
        };

    }

}

const portas = {};

for(let i=1;i<=30;i++){

    portas[i] = new Porta(i);

}

module.exports = portas;
