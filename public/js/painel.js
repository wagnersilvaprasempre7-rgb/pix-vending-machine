async function carregarPortas() {

    const resposta = await fetch("/portas");

    const portas = await resposta.json();

    const painel = document.getElementById("portas");

    painel.innerHTML = "";

    Object.values(portas).forEach(porta => {

        painel.innerHTML += `

        <div class="porta">

            <h3>🚪 Porta ${porta.id}</h3>

            <p><strong>Produto:</strong> ${porta.produto.nome || "Sem produto"}</p>

            <p><strong>Preço:</strong> R$ ${porta.produto.preco}</p>

            <p><strong>Estoque:</strong> ${porta.produto.estoque}</p>

            <p><strong>Status:</strong> ${porta.aberta ? "🟢 Aberta" : "🔴 Fechada"}</p>

            <button onclick="abrirPorta(${porta.id})">

                Abrir Porta

            </button>

        </div>

        `;

    });

}

async function abrirPorta(porta){

    await fetch(`/liberar/${porta}?token=123456`);

    carregarPortas();

}

carregarPortas();

setInterval(carregarPortas,3000);
