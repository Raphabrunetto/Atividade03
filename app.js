const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const port = 3333;

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'positivo',
    database: 'atividade'
});

connection.connect(function (err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Conectado com sucesso!");
});

// GET /produtos - Buscar todos os produtos
app.get("/produtos", (request, response) => {
    const sql = "SELECT * FROM produtos";

    connection.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ error: 'Erro interno do servidor. Não foi possível realizar a consulta.' });
        }

        if (result.length === 0) {
            return response.status(404).json({ error: 'Nenhum produto encontrado.' });
        }

        response.status(200).json(result);
    });
});

// DELETE /produtos/:id - Remover um produto pelo ID
app.delete("/produtos/:id", (request, response) => {
    const { id } = request.params;

    const sql = "DELETE FROM produtos WHERE id = ?";

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ error: 'Erro ao excluir o produto. Tente novamente.' });
        }

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: 'Produto não encontrado' });
        }

        response.status(200).json({
            message: `Produto com ID ${id} removido com sucesso!`
        });
    });
});

// POST /produtos - Adicionar um novo produto
app.post("/produtos", (request, response) => {
    const { name, fornecedor, endereco_fornecedor, quantidade, endereco, preco_unitario } = request.body;

    if (!name || !fornecedor || !endereco_fornecedor || !quantidade || !endereco || !preco_unitario) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const sql = "INSERT INTO produtos (name, fornecedor, endereco_fornecedor, quantidade, endereco, preco_unitario) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(sql, [name, fornecedor, endereco_fornecedor, quantidade, endereco, preco_unitario], (err, result) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ error: 'Erro ao adicionar o produto. Tente novamente.' });
        }
        response.status(201).json({
            message: 'Produto adicionado com sucesso!',
            id: result.insertId
        });
    });
});

// PUT /produtos/:id - Atualizar um produto pelo ID
app.put("/produtos/:id", (request, response) => {
    const { id } = request.params;
    const { name, fornecedor, endereco_fornecedor, quantidade, endereco, preco_unitario } = request.body;

    if (!name || !fornecedor || !endereco_fornecedor || !quantidade || !endereco || !preco_unitario) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const sql = `
        UPDATE produtos
        SET name = ?, fornecedor = ?, endereco_fornecedor = ?, quantidade = ?, endereco = ?, preco_unitario = ?
        WHERE id = ?
    `;

    connection.query(sql, [name, fornecedor, endereco_fornecedor, quantidade, endereco, preco_unitario, id], (err, result) => {
        if (err) {
            console.error(err);
            return response.status(500).json({ error: 'Erro ao atualizar o produto. Tente novamente.' });
        }

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: 'Produto não encontrado' });
        }

        response.status(200).json({
            message: `Produto com ID ${id} atualizado com sucesso!`
        });
    });
});

// Tratamento de método não implementado (501)
app.all("*", (request, response) => {
    return response.status(501).json({ error: 'Método não implementado.' });
});

// Tratamento de erros externos (502)
app.use((err, request, response, next) => {
    if (err) {
        console.error("Erro externo: ", err);
        return response.status(502).json({ error: 'Erro externo ao processar a requisição.' });
    }
    next();
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
