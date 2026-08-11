const express = require('express');
const db = require('../db');
const { encontrarPorCodigo, encontrarPorTexto } = require('../erros-conhecidos');

const router = express.Router();

// Chamado pelo próprio LuxAuto (não pelo navegador), então não passa pelo login
// do LuxMenu — só devolve links de vídeo público, não expõe nada sensível.
router.post('/', (req, res) => {
    const { codigo, mensagem } = req.body;
    if (!codigo && !mensagem) return res.status(400).json({ error: 'informe "codigo" e/ou "mensagem"' });

    const erro = (codigo && encontrarPorCodigo(codigo)) || (mensagem && encontrarPorTexto(mensagem));

    if (!erro) return res.json({ encontrado: false });

    const placeholders = erro.videoIds.map(() => '?').join(',');
    const videos = db.prepare(`
        SELECT v.id, v.titulo, v.url, v.descricao FROM videos v
        WHERE v.id IN (${placeholders})
    `).all(...erro.videoIds);

    // O padrão de erro bateu, mas o vídeo cadastrado pra ele foi removido/ainda não
    // foi regravado — trata como "não encontrado" em vez de devolver uma lista vazia.
    if (!videos.length) return res.json({ encontrado: false });

    res.json({ encontrado: true, erroId: erro.id, videos });
});

module.exports = router;
