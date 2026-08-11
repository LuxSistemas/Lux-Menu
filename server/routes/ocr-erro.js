const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const db = require('../db');
const { encontrarPorTexto } = require('../erros-conhecidos');

const router = express.Router();

const CACHE_DIR = path.join(db.dataDir, 'tesseract-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Mantém o worker do Tesseract vivo entre requisições — criar um novo a cada
// chamada pagaria de novo o custo de carregar os dados do idioma.
let workerPromise = null;
function getWorker() {
    if (!workerPromise) workerPromise = createWorker('por', 1, { cachePath: CACHE_DIR });
    return workerPromise;
}

router.post('/', upload.single('imagem'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'nenhuma imagem enviada' });

    let texto;
    try {
        const worker = await getWorker();
        const resultado = await worker.recognize(req.file.buffer);
        texto = resultado.data.text;
    } catch {
        return res.status(500).json({ error: 'não consegui ler o texto da imagem' });
    }

    const erro = encontrarPorTexto(texto);

    if (!erro) {
        return res.json({ encontrado: false, textoLido: texto.trim() });
    }

    const placeholders = erro.videoIds.map(() => '?').join(',');
    const videos = db.prepare(`
        SELECT v.*, c.nome AS categoria_nome FROM videos v
        LEFT JOIN categorias_video c ON c.id = v.categoria_id
        WHERE v.id IN (${placeholders})
    `).all(...erro.videoIds);

    // O padrão de erro bateu, mas o vídeo cadastrado pra ele foi removido/ainda não
    // foi regravado — trata como "não encontrado" em vez de devolver uma lista vazia.
    if (!videos.length) {
        return res.json({ encontrado: false, textoLido: texto.trim() });
    }

    res.json({ encontrado: true, erroId: erro.id, videos });
});

module.exports = router;
