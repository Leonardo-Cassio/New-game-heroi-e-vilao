const express = require('express');
const path = require('path');
const sql = require('mssql');

const app = express();
const PORT = 3000;

// Configuração do banco de dados
const config = {
    user: 'leobank',
    password: '22052003Leo',
    server: 'vaibrazilian.database.windows.net',
    database: 'fatec-projeto-nodevue',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};

app.use(express.json());

// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

// Rota para atualizar a vida do herói e do vilão
app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
      MERGE INTO Personagens AS target
      USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
      ON target.Nome = source.Nome
      WHEN MATCHED THEN
        UPDATE SET Vida = source.Vida
      WHEN NOT MATCHED THEN
        INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
      `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

app.post('/login', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query(`
            SELECT * FROM Usuarios WHERE nome = '${nome}' AND email = '${email} AND senha = '${senha}'
        `);

        if (result.recordset.length > 0) {
            res.status(200).send('Login bem-sucedido.');
        } else {
            res.status(401).send('Credenciais inválidas.');
        }
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).send('Erro ao fazer login.');
    }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            INSERT INTO Usuarios (nome, email, senha)
            VALUES ('${nome}', '${email}', '${senha}')
        `);
        res.status(201).send('Conta criada com sucesso.');
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        res.status(500).send('Erro ao criar conta.');
    }
});

// Rota para fornecer os dados do herói e do vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Consulta para obter os dados do vilão
        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});