// Lista central de erros conhecidos do LuxAuto e os vídeos que explicam como
// resolver cada um. Usada tanto pelo diagnóstico por print (OCR) quanto pelo
// endpoint que o próprio LuxAuto pode chamar direto (com o código SEFAZ, sem
// precisar de imagem nenhuma).
//
// codigo: código de rejeição da SEFAZ (quando existir) — bate exato, é o jeito
//         mais confiável de identificar o erro.
// bate:   usado como reforço/alternativa quando não tem o código (ex: texto lido
//         por OCR de um print).
const ERROS_CONHECIDOS = [
    {
        id: 'ie-destinatario',
        codigo: 232,
        bate: (texto) => texto.includes('ie do destinatario') && texto.includes('nao informada'),
        videoIds: [6],
    },
];

function normalizarTexto(str) {
    return String(str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function encontrarPorCodigo(codigo) {
    const cod = Number(codigo);
    return ERROS_CONHECIDOS.find((e) => e.codigo === cod);
}

function encontrarPorTexto(texto) {
    const normalizado = normalizarTexto(texto);
    return ERROS_CONHECIDOS.find((e) => e.bate(normalizado));
}

module.exports = { ERROS_CONHECIDOS, normalizarTexto, encontrarPorCodigo, encontrarPorTexto };
