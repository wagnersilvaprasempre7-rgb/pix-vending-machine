const produtos = {
  1: { porta: 1, nome: "Água Mineral", valor: 5.00 },
  2: { porta: 2, nome: "Refrigerante", valor: 7.00 },
  3: { porta: 3, nome: "Chocolate", valor: 5.00 },
  4: { porta: 4, nome: "Biscoito", valor: 4.00 },
  5: { porta: 5, nome: "Snack", valor: 6.00 },
  6: { porta: 6, nome: "Castanha-do-Brasil", valor: 8.00 },
  7: { porta: 7, nome: "Energético", valor: 10.00 },
  8: { porta: 8, nome: "Suco", valor: 6.00 },
  9: { porta: 9, nome: "Água com Gás", valor: 5.00 },
  10: { porta: 10, nome: "Produto Regional", valor: 8.00 }
};

for (let i = 11; i <= 30; i++) {
  produtos[i] = {
    porta: i,
    nome: `Produto Porta ${i}`,
    valor: 5.00
  };
}

module.exports = produtos;
