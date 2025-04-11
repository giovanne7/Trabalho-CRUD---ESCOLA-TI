# 🧙‍♂️ API de Gerenciamento de Personagens e Itens Mágicos (RPG)

Este projeto é uma API RESTful desenvolvida com **Node.js + Express** para gerenciar personagens e itens mágicos em um cenário de RPG. A aplicação também conta com uma interface **CLI (linha de comando)** integrada para facilitar testes e operações simples.

---

## 🚀 Funcionalidades

- Cadastro, listagem, edição e exclusão de **personagens**;
- Cadastro e listagem de **itens mágicos** (armas, armaduras e amuletos);
- Atribuição e remoção de itens mágicos a personagens;
- Restrição para **apenas 1 amuleto por personagem**;
- Regras de validação específicas para cada tipo de item;
- Consulta dos status totais de um personagem (força e defesa somando itens);
- Menu interativo via **CLI** (console) com várias funcionalidades;
- Documentação Swagger disponível na rota `/api-docs`.

---
## 🛠️ Requisitos

- Node.js (v16 ou superior)
- npm (gerenciador de pacotes)

---
## 📦 Como Rodar

node index.js
Servidor rodando na porta 3000

🌐 Rotas da API
Método	Rota	Descrição
GET	/	Verifica se o servidor está funcionando
GET	/personagens	Lista todos os personagens
POST	/personagens	Cria um novo personagem
GET	/personagens/:id	Retorna detalhes de um personagem
PATCH	/personagens/:id	Edita o nome de um personagem
DELETE	/personagens/:id	Remove um personagem
POST	/personagens/:id/itens	Adiciona um item mágico ao personagem
GET	/personagens/:id/itens	Lista os itens de um personagem
DELETE	/personagens/:id/itens/:itemId	Remove um item do personagem
GET	/personagens/:id/itens/amuleto	Retorna o amuleto do personagem
POST	/itens	Cria um novo item mágico
GET	/itens	Lista todos os itens mágicos
GET	/itens/:id	Retorna os detalhes de um item mágico
