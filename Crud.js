//Codando isso após sair de uma sessão de D&D

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const readline = require('readline');

app.use(express.json());

let personagens = [];
let itensMagicos = [];

const generateId = () => Math.floor(Math.random() * 100000);

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.post('/personagens', (req, res) => {
  const { nome, nomeAventureiro, classe, level, forca, defesa } = req.body;
  if (!nome || !nomeAventureiro || !classe || level === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios não enviados' });
  }
  if (forca + defesa !== 10) {
    return res.status(400).json({ error: 'A soma de força e defesa deve ser igual a 10' });
  }
  const classesPermitidas = ['Guerreiro', 'Mago', 'Arqueiro', 'Ladino', 'Bardo'];
  if (!classesPermitidas.includes(classe)) {
    return res.status(400).json({ error: 'Classe inválida' });
  }
  const personagem = {
    id: generateId(),
    nome,
    nomeAventureiro,
    classe,
    level,
    forca,
    defesa,
    itens: []
  };
  personagens.push(personagem);
  return res.status(201).json(personagem);
});

app.get('/personagens', (req, res) => {
  return res.json(personagens);
});

app.get('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const personagem = personagens.find(p => p.id === id);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  const somaForcaItens = personagem.itens.reduce((acc, item) => acc + item.forca, 0);
  const somaDefesaItens = personagem.itens.reduce((acc, item) => acc + item.defesa, 0);
  return res.json({
    ...personagem,
    totalForca: personagem.forca + somaForcaItens,
    totalDefesa: personagem.defesa + somaDefesaItens
  });
});

app.patch('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nome } = req.body;
  const personagem = personagens.find(p => p.id === id);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  personagem.nome = nome || personagem.nome;
  return res.json(personagem);
});

app.delete('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = personagens.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  personagens.splice(index, 1);
  return res.json({ message: 'Personagem removido com sucesso' });
});

app.post('/personagens/:id/itens', (req, res) => {
  const personagemId = Number(req.params.id);
  const personagem = personagens.find(p => p.id === personagemId);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  const { itemId } = req.body;
  const item = itensMagicos.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item mágico não encontrado' });
  }
  if (item.tipo === 'Amuleto') {
    const jaTemAmuleto = personagem.itens.some(i => i.tipo === 'Amuleto');
    if (jaTemAmuleto) {
      return res.status(400).json({ error: 'Personagem já possui um Amuleto' });
    }
  }
  personagem.itens.push(item);
  return res.json(personagem);
});

app.get('/personagens/:id/itens', (req, res) => {
  const personagemId = Number(req.params.id);
  const personagem = personagens.find(p => p.id === personagemId);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  return res.json(personagem.itens);
});

app.delete('/personagens/:id/itens/:itemId', (req, res) => {
  const personagemId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const personagem = personagens.find(p => p.id === personagemId);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  const index = personagem.itens.findIndex(i => i.id === itemId);
  if (index === -1) {
    return res.status(404).json({ error: 'Item não encontrado no personagem' });
  }
  personagem.itens.splice(index, 1);
  return res.json({ message: 'Item removido com sucesso do personagem' });
});

app.get('/personagens/:id/itens/amuleto', (req, res) => {
  const personagemId = Number(req.params.id);
  const personagem = personagens.find(p => p.id === personagemId);
  if (!personagem) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  const amuleto = personagem.itens.find(i => i.tipo === 'Amuleto');
  if (!amuleto) {
    return res.status(404).json({ error: 'Amuleto não encontrado' });
  }
  return res.json(amuleto);
});

app.post('/itens', (req, res) => {
  const { nome, tipo, forca, defesa } = req.body;
  if (!nome || !tipo || forca === undefined || defesa === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios não enviados' });
  }
  const tiposPermitidos = ['Arma', 'Armadura', 'Amuleto'];
  if (!tiposPermitidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de item inválido' });
  }
  if (tipo === 'Arma' && defesa !== 0) {
    return res.status(400).json({ error: 'Itens do tipo Arma devem ter defesa igual a 0' });
  }
  if (tipo === 'Armadura' && forca !== 0) {
    return res.status(400).json({ error: 'Itens do tipo Armadura devem ter força igual a 0' });
  }
  if (forca > 10 || defesa > 10) {
    return res.status(400).json({ error: 'Os atributos de força e defesa não podem ser maiores que 10' });
  }
  if (forca === 0 && defesa === 0) {
    return res.status(400).json({ error: 'Item deve ter pelo menos um valor diferente de zero entre força e defesa' });
  }
  const item = {
    id: generateId(),
    nome,
    tipo,
    forca,
    defesa
  };
  itensMagicos.push(item);
  return res.status(201).json(item);
});

app.get('/itens', (req, res) => {
  return res.json(itensMagicos);
});

app.get('/itens/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = itensMagicos.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item mágico não encontrado' });
  }
  return res.json(item);
});

const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

const rlCli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exibirMenu() {
  console.log('\n===== Gerenciamento RPG =====');
  console.log('1. Cadastrar Personagem');
  console.log('2. Listar Personagens');
  console.log('3. Cadastrar Item Mágico');
  console.log('4. Listar Itens Mágicos');
  console.log('5. Adicionar Item Mágico ao Personagem');
  console.log('6. Listar Itens de um Personagem');
  console.log('7. Buscar Amuleto do Personagem');
  console.log('8. Sair');
  rlCli.question('Escolha uma opção: ', (opcao) => {
    tratarOpcao(opcao);
  });
}

function tratarOpcao(opcao) {
  switch (opcao.trim()) {
    case '1':
      cadastrarPersonagemCLI();
      break;
    case '2':
      listarPersonagensCLI();
      break;
    case '3':
      cadastrarItemMagicoCLI();
      break;
    case '4':
      listarItensMagicosCLI();
      break;
    case '5':
      adicionarItemAoPersonagemCLI();
      break;
    case '6':
      listarItensDoPersonagemCLI();
      break;
    case '7':
      buscarAmuletoCLI();
      break;
    case '8':
      console.log('Saindo do menu interativo...');
      rlCli.close();
      break;
    default:
      console.log('Opção inválida.');
      exibirMenu();
  }
}

function cadastrarPersonagemCLI() {
  let novoPersonagem = {};
  rlCli.question('Nome: ', (nome) => {
    novoPersonagem.nome = nome;
    rlCli.question('Nome Aventureiro: ', (nomeAventureiro) => {
      novoPersonagem.nomeAventureiro = nomeAventureiro;
      rlCli.question('Classe (Guerreiro, Mago, Arqueiro, Ladino ou Bardo): ', (classe) => {
        novoPersonagem.classe = classe;
        rlCli.question('Level (número): ', (level) => {
          novoPersonagem.level = parseInt(level);
          rlCli.question('Força (pontos): ', (forca) => {
            novoPersonagem.forca = parseInt(forca);
            rlCli.question('Defesa (pontos): ', (defesa) => {
              novoPersonagem.defesa = parseInt(defesa);
              if (novoPersonagem.forca + novoPersonagem.defesa !== 10) {
                console.log('Erro: A soma de força e defesa deve ser igual a 10.');
                exibirMenu();
              } else {
                const classesPermitidas = ['Guerreiro', 'Mago', 'Arqueiro', 'Ladino', 'Bardo'];
                if (!classesPermitidas.includes(novoPersonagem.classe)) {
                  console.log('Erro: Classe inválida.');
                  exibirMenu();
                  return;
                }
                novoPersonagem.id = generateId();
                novoPersonagem.itens = [];
                personagens.push(novoPersonagem);
                console.log('Personagem cadastrado com sucesso!');
                console.log(novoPersonagem);
                exibirMenu();
              }
            });
          });
        });
      });
    });
  });
}

function listarPersonagensCLI() {
  if (personagens.length === 0) {
    console.log('Nenhum personagem cadastrado.');
  } else {
    console.log('\n--- Lista de Personagens ---');
    personagens.forEach((p) => {
      const somaForcaItens = p.itens.reduce((acc, item) => acc + item.forca, 0);
      const somaDefesaItens = p.itens.reduce((acc, item) => acc + item.defesa, 0);
      console.log(`ID: ${p.id} | Nome: ${p.nome} | Aventureiro: ${p.nomeAventureiro} | Força total: ${p.forca + somaForcaItens} | Defesa total: ${p.defesa + somaDefesaItens}`);
    });
  }
  exibirMenu();
}

function cadastrarItemMagicoCLI() {
  rlCli.question('Nome do item: ', (nome) => {
    rlCli.question('Tipo (Arma, Armadura, Amuleto): ', (tipo) => {
      if (!['Arma', 'Armadura', 'Amuleto'].includes(tipo)) {
        console.log('Erro: Tipo inválido.');
        return exibirMenu();
      }
      rlCli.question('Força: ', (forca) => {
        rlCli.question('Defesa: ', (defesa) => {
          let f = parseInt(forca);
          let d = parseInt(defesa);
          if (f > 10 || d > 10 || (f === 0 && d === 0)) {
            console.log('Erro: Atributos inválidos.');
            return exibirMenu();
          }
          if (tipo === 'Arma' && d !== 0) {
            console.log('Erro: Armas devem ter defesa igual a 0.');
            return exibirMenu();
          }
          if (tipo === 'Armadura' && f !== 0) {
            console.log('Erro: Armaduras devem ter força igual a 0.');
            return exibirMenu();
          }
          const novoItem = { id: generateId(), nome, tipo, forca: f, defesa: d };
          itensMagicos.push(novoItem);
          console.log('Item mágico cadastrado com sucesso!');
          console.log(novoItem);
          exibirMenu();
        });
      });
    });
  });
}

function listarItensMagicosCLI() {
  if (itensMagicos.length === 0) {
    console.log('Nenhum item mágico cadastrado.');
  } else {
    console.log('\n--- Lista de Itens Mágicos ---');
    itensMagicos.forEach((i) => {
      console.log(`ID: ${i.id} | Nome: ${i.nome} | Tipo: ${i.tipo} | Força: ${i.forca} | Defesa: ${i.defesa}`);
    });
  }
  exibirMenu();
}

function adicionarItemAoPersonagemCLI() {
  rlCli.question('ID do personagem: ', (idPersonagem) => {
    const p = personagens.find(p => p.id == idPersonagem);
    if (!p) {
      console.log('Personagem não encontrado.');
      return exibirMenu();
    }
    rlCli.question('ID do item: ', (idItem) => {
      const i = itensMagicos.find(i => i.id == idItem);
      if (!i) {
        console.log('Item mágico não encontrado.');
        return exibirMenu();
      }
      if (i.tipo === 'Amuleto' && p.itens.some(it => it.tipo === 'Amuleto')) {
        console.log('Erro: Personagem já possui um Amuleto.');
        return exibirMenu();
      }
      p.itens.push(i);
      console.log('Item adicionado ao personagem com sucesso.');
      exibirMenu();
    });
  });
}

function listarItensDoPersonagemCLI() {
  rlCli.question('ID do personagem: ', (id) => {
    const p = personagens.find(p => p.id == id);
    if (!p) {
      console.log('Personagem não encontrado.');
      return exibirMenu();
    }
    if (p.itens.length === 0) {
      console.log('Personagem não possui itens equipados.');
    } else {
      console.log(`Itens equipados em ${p.nome}:`);
      p.itens.forEach((i) => {
        console.log(`ID: ${i.id} | Nome: ${i.nome} | Tipo: ${i.tipo} | Força: ${i.forca} | Defesa: ${i.defesa}`);
      });
    }
    exibirMenu();
  });
}

function buscarAmuletoCLI() {
  rlCli.question('ID do personagem: ', (id) => {
    const p = personagens.find(p => p.id == id);
    if (!p) {
      console.log('Personagem não encontrado.');
      return exibirMenu();
    }
    const amuleto = p.itens.find(i => i.tipo === 'Amuleto');
    if (!amuleto) {
      console.log('Nenhum amuleto equipado.');
    } else {
      console.log('Amuleto equipado:');
      console.log(amuleto);
    }
    exibirMenu();
  });
}

exibirMenu();
