// Enriquece as tags de todos os vídeos para melhorar a busca.
// Pode rodar de novo sem problema — sempre sobrescreve com os valores definidos aqui.
const db = require('../db');

const updates = [
    {
        id: 14,
        tags: 'ordem de serviço, OS, fotos, imagem, câmera, anexo, foto, galeria, serviço',
    },
    {
        id: 37,
        tags: 'produto, produtos, cadastro, estoque, mercadoria, item, código de barras, SKU',
    },
    {
        id: 35,
        tags: 'cadastro de carro, veículo, automóvel, placa, auto, modelo, marca, veicular',
    },
    {
        id: 4,
        tags: 'cadastro, cliente, fornecedor, CNPJ, CPF, pessoa física, pessoa jurídica, contato, novo cliente',
    },
    {
        id: 22,
        tags: 'caixa, banco, saldo, conta bancária, financeiro, movimento, extrato, abertura de caixa',
    },
    {
        id: 16,
        tags: 'orçamento, agendar orçamento, agendamento, agenda, marcar, cliente, visita, data, horário',
    },
    {
        id: 15,
        tags: 'orçamento, criar orçamento, novo orçamento, proposta, cotação, produto, cliente',
    },
    {
        id: 36,
        tags: 'inutilizar nota, NFe, cancelamento, inutilização, número, sequência, faixa, nota fiscal',
    },
    {
        id: 3,
        tags: 'pagar fatura, fatura, pagamento, boleto, mensalidade, vencimento, financeiro, sistema',
    },
    {
        id: 2,
        tags: 'conciliação, banco, bancária, financeiro, caixa, extrato, conferência, saldo, lançamento, conferir',
        categoria: 'Financeiro',
    },
    {
        id: 31,
        tags: 'consulta NFe, portal nacional, SEFAZ, consultar nota, chave de acesso, DANFE, status nota',
    },
    {
        id: 21,
        tags: 'contas a pagar, fatura, despesa, vencimento, fornecedor, lançamento, boleto, pagar',
    },
    {
        id: 23,
        tags: 'contas a receber, recebimento, cliente, cobrança, crédito, vencimento, parcela, receber',
    },
    {
        id: 11,
        tags: 'ordem de serviço, OS, criar OS, novo serviço, abertura, manutenção, reparo, técnico, oficina',
    },
    {
        id: 27,
        tags: 'devolução, NFe, nota fiscal, retorno, mercadoria, estorno, nota de retorno, devolver',
    },
    {
        id: 10,
        tags: 'devolução de compra, nota de devolução, fornecedor, retorno, estorno de compra, entrada, devolver',
    },
    {
        id: 5,
        tags: 'cadastro, cliente, dúvidas, CNPJ, CPF, endereço, contato, erro, problema, frequentes',
    },
    {
        id: 26,
        tags: 'NFSe, nota fiscal de serviço, emissão, serviço, prefeitura, ISS, NFS-e, emitir, nota de serviço',
    },
    {
        id: 29,
        tags: 'NFCe, PDV, emissão, cupom fiscal, frente de caixa, venda, consumidor, NFC-e, balcão, caixa',
    },
    {
        id: 18,
        tags: 'pedido, pedidos, venda, ordem de venda, cliente, produto, faturar, lançar pedido',
    },
    {
        id: 28,
        tags: 'contabilidade, envio de documentos, XML, SPED, contador, nota fiscal, remessa, documentos fiscais',
    },
    {
        id: 6,
        tags: 'inscrição estadual, IE, erro cadastro, cliente, fornecedor, ICMS, rejeição, contribuinte, inscrição',
    },
    {
        id: 33,
        tags: 'estorno, contas a pagar, cancelar pagamento, reverter, desfazer, lançamento, financeiro',
    },
    {
        id: 12,
        tags: 'ordem de serviço, OS, etapas, status, andamento, progresso, técnico, fase, kanban, movimentar',
    },
    {
        id: 20,
        tags: 'forma de pagamento, pagamento, dinheiro, cartão, PIX, boleto, crédito, débito, cheque, parcelamento',
    },
    {
        id: 13,
        tags: 'ordem de serviço, OS, orçamento, gerar OS, converter orçamento, aprovação, aprovado',
    },
    {
        id: 25,
        tags: 'ordem de serviço, OS, nota fiscal, importar OS, NFe, faturar OS, emitir nota, serviço fiscal',
    },
    {
        id: 30,
        tags: 'CFOP, IBS, CBS, produto, liberação, reforma tributária, tributação, fiscal, imposto, código fiscal',
    },
    {
        id: 34,
        tags: 'nota de compra, uso e consumo, entrada, compra interna, despesa, material, consumo',
    },
    {
        id: 8,
        tags: 'nota fiscal manual, NFe manual, fornecedor, compra, digitar nota, entrada manual, lançar nota',
    },
    {
        id: 9,
        tags: 'nota fiscal manual, inserir produtos, NFe, fornecedor, adicionar produtos, lançar itens, entrada',
    },
    {
        id: 7,
        tags: 'nota fiscal, importação de nota, NFe, fornecedor, compra, importar XML, XML, nota de entrada',
    },
    {
        id: 19,
        tags: 'plano de contas, centro de custo, contabilidade, categoria, financeiro, gerencial, classificação',
    },
    {
        id: 17,
        tags: 'PDV, ponto de venda, venda, resumo, caixa, frente de caixa, NFC-e, balcão, vender',
    },
    {
        id: 32,
        tags: 'salvar nota, XML, nota fiscal, download, arquivo, pasta, DANFE, guardar, baixar',
    },
    {
        id: 24,
        tags: 'transferência, conta, banco, PIX, movimentação, caixa, saldo, TED',
    },
];

const stmtTags = db.prepare('UPDATE videos SET tags = ? WHERE id = ?');
const stmtCategoria = db.prepare(
    'UPDATE videos SET categoria_id = (SELECT id FROM categorias_video WHERE nome = ?) WHERE id = ?'
);

let ok = 0;
for (const u of updates) {
    const changes = stmtTags.run(u.tags, u.id).changes;
    if (u.categoria) stmtCategoria.run(u.categoria, u.id);
    if (changes) ok++;
}

console.log(`Tags atualizadas: ${ok}/${updates.length} vídeos`);
